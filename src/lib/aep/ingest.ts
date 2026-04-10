export interface IngestProfilePayload {
  userId: string | number;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  emailMarketingConsent?: boolean;
  phoneNumber?: string | null;
  phoneMarketingConsent?: boolean;
}

/**
 * Upserts profile attributes (name, date of birth) into AEP via server-side
 * Batch Ingestion API so that RTCP reflects the latest user data.
 * Errors are swallowed — ingestion failures must not break the user flow.
 */
export async function ingestProfile(payload: IngestProfilePayload): Promise<void> {
  try {
    await fetch('/api/aep/ingest-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        userId: String(payload.userId),
      }),
    });
  } catch (err) {
    console.warn('[AEP] Profile ingestion failed:', err);
  }
}
