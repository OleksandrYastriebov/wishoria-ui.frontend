import type { AlloyInstance, AEPConfig, WishoriaXDMEvent } from './types';
import { getAEPConfig, isAEPConfigured } from './config';

let alloyInstance: AlloyInstance | null = null;
/** Prevents duplicate initialization attempts (e.g., React StrictMode double-invoke) */
let initPromise: Promise<AlloyInstance | null> | null = null;

export async function initAlloy(): Promise<AlloyInstance | null> {
  if (typeof window === 'undefined') return null;
  if (alloyInstance) return alloyInstance;

  // Deduplicate concurrent init calls (React StrictMode, double-render scenarios)
  if (initPromise) return initPromise;

  initPromise = performInit();
  const result = await initPromise;
  return result;
}

async function performInit(): Promise<AlloyInstance | null> {
  const config = getAEPConfig();

  if (!isAEPConfigured(config)) {
    return null;
  }

  try {
    const { createInstance } = await import('@adobe/alloy');
    const instance = createInstance({ name: 'alloy' }) as AlloyInstance;

    await instance('configure', buildAlloyConfig(config));

    alloyInstance = instance;

    if (config.debugEnabled) {
      console.info('[AEP] Web SDK initialized.', { orgId: config.orgId, datastreamId: config.datastreamId });
    }

    return instance;
  } catch (err) {
    console.error('[AEP] Initialization failed:', err);
    initPromise = null;
    return null;
  }
}

function buildAlloyConfig(config: AEPConfig): Record<string, unknown> {
  return {
    datastreamId: config.datastreamId,
    orgId: config.orgId,
    edgeDomain: config.edgeDomain,
    defaultConsent: 'in',
    idMigrationEnabled: true,
    thirdPartyCookiesEnabled: false,
    clickCollectionEnabled: false,
    debugEnabled: config.debugEnabled,
  };
}

// ─── Event Sending ────────────────────────────────────────────────────────────

export async function sendAEPEvent(
  xdm: WishoriaXDMEvent,
  renderDecisions = false,
  datastreamId?: string
): Promise<void> {
  if (typeof window === 'undefined') return;

  if (!alloyInstance) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[AEP] sendEvent skipped (Alloy not initialized):', xdm.eventType);
    }
    return;
  }

  try {
    await alloyInstance('sendEvent', {
      xdm: {
        ...xdm,
        timestamp: xdm.timestamp ?? new Date().toISOString(),
      },
      renderDecisions,
      ...(datastreamId && { edgeConfigOverrides: { datastreamId } }),
    });

    if (process.env.NEXT_PUBLIC_AEP_DEBUG === 'true') {
      console.debug('[AEP] Event sent:', xdm.eventType, datastreamId ? `(datastream: ${datastreamId})` : '', xdm);
    }
  } catch (err) {
    console.error('[AEP] sendEvent failed:', err);
  }
}

// ─── Datastream Resolution ────────────────────────────────────────────────────

export function resolveDatastreamId(domain: 'auth' | 'wishlist' | 'pageView'): string | undefined {
  const config = getAEPConfig();
  const id = config.datastreamIds[domain];
  return id || undefined;
}

// ─── Identity ─────────────────────────────────────────────────────────────────

export async function getECID(): Promise<string | null> {
  if (!alloyInstance) return null;

  try {
    const result = (await alloyInstance('getIdentity')) as {
      identity: { ECID: string };
    };
    return result?.identity?.ECID ?? null;
  } catch (err) {
    console.error('[AEP] getIdentity failed:', err);
    return null;
  }
}

export function getAlloy(): AlloyInstance | null {
  return alloyInstance;
}
