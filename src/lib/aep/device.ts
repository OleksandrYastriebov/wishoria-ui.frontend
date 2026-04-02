/**
 * First-party browser device identity management.
 *
 * WHY A DEVICE COOKIE?
 * ────────────────────
 * GAID (Google Advertising ID) and IDFA (Apple Identifier for Advertisers)
 * are mobile OS-level identifiers — they are NOT available in any web browser.
 * Web browsers do not expose advertising IDs.
 *
 * For web, the correct approach is a first-party persistent cookie containing
 * a UUID. This "_wishoria_did" cookie serves the same purpose as GAID:
 *   - Stable across browser sessions (1-year expiry)
 *   - Survives user logout (links anonymous → known sessions on re-login)
 *   - Not blocked by third-party cookie policies (it's first-party)
 *   - Mapped to custom AEP namespace "WISHORIA_DEVICE" in the identity graph
 *
 * HOW IT FITS IN THE IDENTITY GRAPH:
 *   Anonymous visit  → [ECID] + [WISHORIA_DEVICE]
 *   Login            → [ECID] + [WISHORIA_DEVICE] + [CRMID] + [Email] ← stitched
 *   Re-login later   → AEP re-stitches the same graph via device cookie
 *
 * GAID / IDFA NOTE:
 *   If you later build a React Native mobile app, add GAID (Android) or
 *   IDFA (iOS) as a 5th identity namespace. The web "_wishoria_did" cookie
 *   and the mobile GAID will both stitch to the same CRMID.
 */

const DEVICE_COOKIE_NAME = '_wishoria_did';
/** Cookie lifetime: 1 year in seconds */
const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Generates a UUID v4 string.
 * Uses the native crypto.randomUUID() when available (all modern browsers).
 * Falls back to a Math.random() implementation for legacy environments.
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Legacy fallback (IE11, very old mobile browsers)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Reads a cookie value by name from document.cookie.
 * Returns null when running server-side or when the cookie does not exist.
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const row = document.cookie
    .split('; ')
    .find((pair) => pair.startsWith(`${name}=`));
  return row ? decodeURIComponent(row.split('=')[1]) : null;
}

/**
 * Writes a first-party cookie with SameSite=Lax and Secure (on HTTPS).
 */
function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === 'undefined') return;
  const isSecure =
    typeof window !== 'undefined' && window.location.protocol === 'https:';
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `max-age=${maxAge}`,
    'path=/',
    'SameSite=Lax',
    ...(isSecure ? ['Secure'] : []),
  ];
  document.cookie = parts.join('; ');
}

/**
 * Returns the persistent device ID for this browser.
 * Creates and persists a new UUID if none exists yet.
 *
 * Idempotent — calling multiple times returns the same value.
 * Safe to call before Alloy is initialized.
 */
export function getOrCreateDeviceId(): string {
  const existing = getCookie(DEVICE_COOKIE_NAME);
  if (existing) return existing;

  const newId = generateUUID();
  setCookie(DEVICE_COOKIE_NAME, newId, DEVICE_COOKIE_MAX_AGE);
  return newId;
}

/**
 * Returns the current device ID without creating a new one.
 * Returns null if no device cookie exists (e.g., first-ever visit before
 * getOrCreateDeviceId() has been called).
 */
export function getDeviceId(): string | null {
  return getCookie(DEVICE_COOKIE_NAME);
}
