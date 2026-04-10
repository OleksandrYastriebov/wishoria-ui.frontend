import { NextRequest, NextResponse } from 'next/server';

const STREAMING_INLET_URL = `https://dcs.adobedc.net/collection/${process.env.AEP_STREAMING_INLET_ID}`;

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

  if (!process.env.AEP_STREAMING_INLET_ID) {
    return NextResponse.json({ error: 'AEP_STREAMING_INLET_ID is not configured' }, { status: 500 });
  }

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

  const payload = {
    header: {
      schemaRef: {
        id: process.env.AEP_PROFILE_SCHEMA_ID,
        contentType: 'application/vnd.adobe.xed-full+json;version=1',
      },
      imsOrgId: process.env.AEP_IMS_ORG_ID,
      datasetId: process.env.AEP_PROFILE_DATASET_ID,
      source: { name: 'wishoria-streaming' },
    },
    body: {
      xdmMeta: {
        schemaRef: {
          id: process.env.AEP_PROFILE_SCHEMA_ID,
          contentType: 'application/vnd.adobe.xed-full+json;version=1',
        },
      },
      xdmEntity: xdmRecord,
    },
  };

  const res = await fetch(STREAMING_INLET_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[AEP ingest] Streaming ingestion failed:', err);
    return NextResponse.json({ error: `Streaming ingestion failed: ${err}` }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
