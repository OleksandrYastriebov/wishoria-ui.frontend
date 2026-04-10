import { NextRequest, NextResponse } from 'next/server';

const AEP_TOKEN_URL = 'https://ims-na1.adobelogin.com/ims/token/v3';
const AEP_BASE_URL = 'https://platform.adobe.io';

// Simple in-process token cache to avoid fetching a new token on every request
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.value;
  }

  const res = await fetch(AEP_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AEP_CLIENT_ID!,
      client_secret: process.env.AEP_CLIENT_SECRET!,
      scope: 'openid,AdobeID,read_organizations,additional_info.projectedProductContext,session',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`IMS token request failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.value;
}

function aepHeaders(token: string, contentType = 'application/json'): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'x-api-key': process.env.AEP_CLIENT_ID!,
    'x-gw-ims-org-id': process.env.AEP_IMS_ORG_ID!,
    'x-sandbox-name': process.env.AEP_SANDBOX_NAME!,
    'Content-Type': contentType,
  };
}

export async function POST(req: NextRequest) {
  const { userId, email, firstName, lastName, dateOfBirth, emailMarketingConsent, phoneNumber, phoneMarketingConsent } = (await req.json()) as {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string | null;
    emailMarketingConsent?: boolean;
    phoneNumber?: string | null;
    phoneMarketingConsent?: boolean;
  };

  const datasetId = process.env.AEP_PROFILE_DATASET_ID;
  if (!datasetId) {
    return NextResponse.json({ error: 'AEP_PROFILE_DATASET_ID is not configured' }, { status: 500 });
  }

  let token: string;
  try {
    token = await getAccessToken();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[AEP ingest] Token error:', message);
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // 1. Create batch
  const batchRes = await fetch(`${AEP_BASE_URL}/data/foundation/import/batches`, {
    method: 'POST',
    headers: aepHeaders(token),
    body: JSON.stringify({ datasetId, inputFormat: { format: 'json' } }),
  });

  if (!batchRes.ok) {
    const err = await batchRes.text();
    console.error('[AEP ingest] Create batch failed:', err);
    return NextResponse.json({ error: `Create batch failed: ${err}` }, { status: 502 });
  }

  const { id: batchId } = (await batchRes.json()) as { id: string };

  // 2. Build XDM Individual Profile record
  const identityMap: Record<string, unknown> = {
    WISHORIA_CRMID: [{ id: String(userId), primary: true, authenticatedState: 'authenticated' }],
    Email: [{ id: email, primary: false, authenticatedState: 'authenticated' }],
    ...(phoneNumber ? { Phone: [{ id: phoneNumber, primary: false, authenticatedState: 'authenticated' }] } : {}),
  };

  const marketingConsents: Record<string, unknown> = {};
  if (emailMarketingConsent !== undefined) {
    marketingConsents['email'] = { val: emailMarketingConsent ? 'y' : 'n' };
  }
  if (phoneMarketingConsent !== undefined) {
    marketingConsents['sms'] = { val: phoneMarketingConsent ? 'y' : 'n' };
  }

  const xdmRecord: Record<string, unknown> = {
    _id: String(userId),
    identityMap,
    person: {
      name: { firstName, lastName },
      ...(dateOfBirth ? { birthDayAndMonth: dateOfBirth.slice(5) } : {}),
    },
    personalEmail: { address: email },
    ...(phoneNumber ? { mobilePhone: { number: phoneNumber } } : {}),
    ...(Object.keys(marketingConsents).length > 0 && {
      consents: { marketing: marketingConsents },
    }),
  };

  // 3. Upload record (newline-delimited JSON file)
  const fileBody = JSON.stringify(xdmRecord) + '\n';
  const uploadRes = await fetch(
    `${AEP_BASE_URL}/data/foundation/import/batches/${batchId}/datasets/${datasetId}/files/profile.json`,
    {
      method: 'PUT',
      headers: aepHeaders(token, 'application/octet-stream'),
      body: fileBody,
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    console.error('[AEP ingest] File upload failed:', err);
    return NextResponse.json({ error: `File upload failed: ${err}` }, { status: 502 });
  }

  // 4. Signal batch completion
  const completeRes = await fetch(
    `${AEP_BASE_URL}/data/foundation/import/batches/${batchId}?action=COMPLETE`,
    { method: 'POST', headers: aepHeaders(token) }
  );

  if (!completeRes.ok) {
    const err = await completeRes.text();
    console.error('[AEP ingest] Complete batch failed:', err);
    return NextResponse.json({ error: `Complete batch failed: ${err}` }, { status: 502 });
  }

  return NextResponse.json({ success: true, batchId });
}
