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
    // Warning already logged in getAEPConfig()
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
    initPromise = null; // Allow retry on next call
    return null;
  }
}

/**
 * Maps AEPConfig to the alloy("configure") options object.
 *
 * datastreamId here is the PageView datastream — the default for all events
 * that don't specify an override. Auth and Wishlist events override per-call
 * via edgeConfigOverrides.datastreamId in sendAEPEvent().
 */
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

/**
 * Sends an XDM event via Alloy.
 *
 * @param xdm            The XDM event payload.
 * @param renderDecisions Pass true for page-view events to receive personalization.
 * @param datastreamId   If provided, routes the event to that specific datastream
 *                       (Auth / Wishlist / PageView). Uses edgeConfigOverrides.datastreamId
 *                       which the SDK translates to a datastream URL override.
 *                       If omitted, the default datastream from configure() is used.
 */
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

/**
 * Returns the datastream ID for the given event domain.
 * Falls back to the default datastream if the domain-specific ID is not configured.
 */
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
