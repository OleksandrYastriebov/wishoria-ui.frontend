/**
 * Identity map construction for AEP's Identity Service.
 *
 * THE IDENTITY GRAPH — HOW IT WORKS
 * ──────────────────────────────────
 * AEP's Identity Service maintains a graph where different identifiers
 * (ECID, CRMID, Email, device cookie) are linked to a single "person".
 *
 * Each time you send an event with an identityMap, AEP evaluates:
 *   "Do any of these IDs already belong to an existing profile?"
 *   If yes → merge into existing profile
 *   If no  → create a new profile node
 *
 * WISHORIA IDENTITY GRAPH:
 *
 *   ┌─────────────────┐        ┌──────────────────────────┐
 *   │  ECID           │◀──────▶│                          │
 *   │  (auto-set      │        │   Unified Customer       │
 *   │   by Alloy)     │        │   Profile in AEP         │
 *   └─────────────────┘        │                          │
 *                              │  Links all 4 namespaces  │
 *   ┌─────────────────┐        │  into one person record  │
 *   │  WISHORIA_CRMID │◀──────▶│                          │
 *   │  (user.id)      │        └──────────────────────────┘
 *   └─────────────────┘                    ▲
 *                                          │
 *   ┌─────────────────┐        ┌───────────┴──────────────┐
 *   │  Email          │◀──────▶│                          │
 *   │  (user.email)   │        │  Stitched at login via   │
 *   └─────────────────┘        │  identityMap with all    │
 *                              │  4 namespaces            │
 *   ┌─────────────────┐        └──────────────────────────┘
 *   │  WISHORIA_DEVICE│◀──────▶
 *   │  (_wishoria_did │
 *   │   cookie)       │
 *   └─────────────────┘
 *
 * KEY MOMENT — THE LOGIN EVENT:
 *   When trackLogin() sends an event with all 4 identities marked "authenticated",
 *   AEP stitches the anonymous ECID (set during anonymous browsing) to the
 *   known CRMID/Email. This means all historical anonymous behavior becomes
 *   attributed to the now-known user.
 *
 * NAMESPACE CODES:
 *   These string values must match exactly what you create in
 *   AEP › Identities › Create identity namespace (case-sensitive).
 *   See AEP_SETUP_GUIDE.md → Step 2.
 */

import type { IdentityMap, IdentityMapEntry } from './types';

/**
 * AEP Identity Namespace symbol codes.
 *
 * ECID and Email are built-in AEP namespaces — do not change their codes.
 * WISHORIA_CRMID and WISHORIA_DEVICE are custom namespaces you must create.
 */
export const IDENTITY_NAMESPACES = {
  /** Built-in: Experience Cloud ID — Alloy manages this automatically */
  ECID: 'ECID',
  /** Built-in: Email address namespace */
  EMAIL: 'Email',
  /**
   * Custom: Wishoria database user ID.
   * Must match the "Identity symbol" you enter when creating the namespace in AEP.
   * Recommended symbol: WISHORIA_CRMID
   * Type: Cross-device ID
   */
  CRMID: 'WISHORIA_CRMID',
  /**
   * Custom: First-party browser device cookie (_wishoria_did).
   * Recommended symbol: WISHORIA_DEVICE
   * Type: Cookie
   */
  DEVICE: 'WISHORIA_DEVICE',
} as const;

/** Creates an array with one IdentityMapEntry (the shape AEP expects) */
function makeEntry(
  id: string,
  primary: boolean,
  authenticatedState: IdentityMapEntry['authenticatedState']
): IdentityMapEntry[] {
  return [{ id, primary, authenticatedState }];
}

/**
 * Identity map for an ANONYMOUS visitor.
 *
 * Only the first-party device cookie is included. ECID is handled by Alloy
 * automatically — you don't include it in identityMap yourself.
 *
 * Use this for page views before the user logs in.
 *
 * @param deviceId - Value from getOrCreateDeviceId()
 */
export function buildAnonymousIdentityMap(deviceId: string): IdentityMap {
  return {
    [IDENTITY_NAMESPACES.DEVICE]: makeEntry(deviceId, true, 'ambiguous'),
  };
}

/**
 * Identity map for an AUTHENTICATED user.
 *
 * Includes CRMID, Email, and Device — the three identifiers that, together
 * with the auto-managed ECID, complete the 4-node identity graph.
 *
 * This map is the "stitching event" — send it on login to link all prior
 * anonymous activity (ECID + device cookie) to the known user account.
 *
 * @param userId   - User's numeric ID from the database (stored as string in AEP)
 * @param email    - User's email address
 * @param deviceId - Value from getOrCreateDeviceId()
 */
export function buildAuthenticatedIdentityMap(
  userId: string | number,
  email: string,
  deviceId: string
): IdentityMap {
  return {
    // CRMID is primary — it's the authoritative unique person identifier
    [IDENTITY_NAMESPACES.CRMID]: makeEntry(String(userId), true, 'authenticated'),
    // Email is non-primary — it's used for cross-channel matching but not the anchor
    [IDENTITY_NAMESPACES.EMAIL]: makeEntry(email, false, 'authenticated'),
    // Device is non-primary — it's a browser-level identifier, not a person-level one
    [IDENTITY_NAMESPACES.DEVICE]: makeEntry(deviceId, false, 'authenticated'),
  };
}

/**
 * Identity map for a LOGGED OUT user.
 *
 * Marks all identifiers as "loggedOut" to signal session end.
 * AEP retains the identity graph — identities are NOT deleted.
 * The next anonymous visit will still be stitchable via the device cookie.
 *
 * @param userId   - User's numeric ID from the database
 * @param email    - User's email address
 * @param deviceId - Value from getDeviceId() — use empty string as fallback
 */
export function buildLoggedOutIdentityMap(
  userId: string | number,
  email: string,
  deviceId: string
): IdentityMap {
  return {
    [IDENTITY_NAMESPACES.CRMID]: makeEntry(String(userId), true, 'loggedOut'),
    [IDENTITY_NAMESPACES.EMAIL]: makeEntry(email, false, 'loggedOut'),
    [IDENTITY_NAMESPACES.DEVICE]: makeEntry(deviceId, false, 'loggedOut'),
  };
}
