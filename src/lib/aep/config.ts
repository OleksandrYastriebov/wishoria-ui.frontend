import type { AEPConfig } from './types';

export function getAEPConfig(): AEPConfig {
  const orgId = process.env.NEXT_PUBLIC_AEP_ORG_ID ?? '';
  const datastreamId = process.env.NEXT_PUBLIC_AEP_DATASTREAM_ID ?? '';
  const edgeDomain = process.env.NEXT_PUBLIC_AEP_EDGE_DOMAIN ?? 'edge.adobedc.net';
  const debugEnabled = process.env.NEXT_PUBLIC_AEP_DEBUG === 'true';

  if (!orgId || !datastreamId) {
    console.warn(
      '[AEP] Missing configuration: NEXT_PUBLIC_AEP_ORG_ID and/or ' +
        'NEXT_PUBLIC_AEP_DATASTREAM_ID are not set. ' +
        'AEP tracking is disabled. See AEP_SETUP_GUIDE.md.'
    );
  }

  return { orgId, datastreamId, edgeDomain, debugEnabled };
}

export function isAEPConfigured(config: AEPConfig): boolean {
  return Boolean(config.orgId && config.datastreamId);
}
