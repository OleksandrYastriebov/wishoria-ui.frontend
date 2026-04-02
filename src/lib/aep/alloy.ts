/**
 * Adobe Alloy (AEP Web SDK) — singleton initialization and core operations.
 *
 * BROWSER-ONLY MODULE
 * ───────────────────
 * Alloy is a browser library. This module uses:
 *   1. Lazy dynamic import (`await import('@adobe/alloy')`) — defers the bundle
 *      until runtime, preventing Next.js SSR errors.
 *   2. `typeof window === 'undefined'` guards — no-ops on the server.
 *
 * SINGLETON PATTERN
 * ─────────────────
 * One Alloy instance is created per page session and reused for all events.
 * The instance is stored in module-level variables (not React state) so it
 * survives React tree re-renders.
 *
 * INITIALIZATION SIDE EFFECTS (happen automatically):
 *   - Alloy contacts the Adobe Edge Network and receives/sets the ECID cookie
 *     (cookie name: amcv_<orgId>  or  kndctr_<orgId>_AdobeOrg_identity)
 *   - The ECID is persisted as a first-party cookie for 2 years
 *   - Alloy establishes a cluster hint to optimize future Edge Network routing
 *
 * ANALYTICS MUST NEVER BREAK THE APP
 * ───────────────────────────────────
 * Every public function in this module catches all errors and either returns
 * null or returns void — never throws to the caller.
 */

import type { AlloyInstance, AEPConfig, WishoriaXDMEvent } from './types';
import { getAEPConfig, isAEPConfigured } from './config';

let alloyInstance: AlloyInstance | null = null;
/** Prevents duplicate initialization attempts (e.g., React StrictMode double-invoke) */
let initPromise: Promise<AlloyInstance | null> | null = null;

// ─── Initialization ───────────────────────────────────────────────────────────

/**
 * Initializes the AEP Web SDK (Adobe Alloy) with values from env variables.
 *
 * Safe to call multiple times — returns the existing instance after the first call.
 * Should be called once from <AEPProvider> on application startup.
 *
 * @returns The configured Alloy instance, or null when:
 *   - Running server-side (SSR)
 *   - Required env vars are missing
 *   - Initialization failed (network error, wrong orgId, etc.)
 */
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
    // Dynamic import keeps Alloy out of the SSR bundle entirely
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
 * Key settings explained:
 *   defaultConsent "in"       — assumes user consented. Change to "pending"
 *                               if you add a cookie consent banner, then call
 *                               alloy("setConsent", ...) after user accepts.
 *   idMigrationEnabled true   — reads legacy amcv_ cookies from Visitor API.
 *                               Safe to keep even if you've never used Visitor API.
 *   thirdPartyCookiesEnabled  — false is safer; 3rd-party cookies are blocked
 *   false                       in Firefox/Safari and being phased out in Chrome.
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
    /**
     * onBeforeEventSend — optional hook to inspect/mutate events before sending.
     * Useful for stripping PII in debug builds or adding global context.
     * Uncomment and customize if needed:
     *
     * onBeforeEventSend: ({ xdm }) => {
     *   if (process.env.NODE_ENV === 'development') {
     *     console.debug('[AEP] Sending event:', xdm);
     *   }
     * },
     */
  };
}

// ─── Event Sending ────────────────────────────────────────────────────────────

/**
 * Sends an XDM ExperienceEvent to AEP via the Adobe Edge Network.
 *
 * Fails silently — never throws. Tracking must not block or crash the app.
 *
 * @param xdm             - The XDM event payload (see WishoriaXDMEvent)
 * @param renderDecisions - Pass true on page views to receive Adobe Target /
 *                          Journey Optimizer personalization decisions.
 *                          Pass false (default) for interaction events.
 */
export async function sendAEPEvent(
  xdm: WishoriaXDMEvent,
  renderDecisions = false
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
        // Ensure timestamp is always present and in ISO 8601 format
        timestamp: xdm.timestamp ?? new Date().toISOString(),
      },
      renderDecisions,
    });

    if (process.env.NEXT_PUBLIC_AEP_DEBUG === 'true') {
      console.debug('[AEP] Event sent:', xdm.eventType, xdm);
    }
  } catch (err) {
    console.error('[AEP] sendEvent failed:', err);
  }
}

// ─── Identity ─────────────────────────────────────────────────────────────────

/**
 * Returns the ECID (Experience Cloud ID) for the current browser session.
 *
 * The ECID is set automatically by Alloy during initialization and persisted
 * as a first-party cookie (valid for 2 years).
 *
 * @returns The ECID string, or null if Alloy is not initialized.
 */
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

/**
 * Returns the current Alloy instance without initializing.
 * Useful for advanced use cases that need direct SDK access.
 */
export function getAlloy(): AlloyInstance | null {
  return alloyInstance;
}
