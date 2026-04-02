/**
 * Adobe Experience Platform (AEP) integration — public API.
 *
 * Import all AEP functionality from this single entry point:
 *
 *   import { trackLogin, trackPageView, trackLogout } from '@/src/lib/aep';
 *   import { initAlloy, getECID } from '@/src/lib/aep';
 *   import { getOrCreateDeviceId } from '@/src/lib/aep';
 *
 * ARCHITECTURE OVERVIEW:
 *   types.ts     — TypeScript interfaces for XDM events and configuration
 *   config.ts    — Reads env vars, validates configuration
 *   device.ts    — First-party device ID cookie management (_wishoria_did)
 *   identity.ts  — Identity map builders (anonymous, authenticated, loggedOut)
 *   alloy.ts     — Alloy SDK singleton: init, sendEvent, getECID
 *   events.ts    — High-level event functions (trackPageView, trackLogin, etc.)
 *   index.ts     — This file: re-exports the public API
 */

// Core SDK
export { initAlloy, sendAEPEvent, getECID, getAlloy } from './alloy';

// High-level event tracking
export {
  trackPageView,
  trackLogin,
  trackLogout,
  trackWishlistView,
  trackWishlistCreated,
  trackItemCreated,
  trackItemReservation,
} from './events';

// Device identity
export { getOrCreateDeviceId, getDeviceId } from './device';

// Identity map utilities (for advanced use cases)
export {
  IDENTITY_NAMESPACES,
  buildAnonymousIdentityMap,
  buildAuthenticatedIdentityMap,
  buildLoggedOutIdentityMap,
} from './identity';

// Types
export type {
  AEPConfig,
  IdentityMap,
  IdentityMapEntry,
  WishoriaXDMEvent,
  WishoriaCustomFields,
  XDMEventType,
  PageType,
  TrackLoginOptions,
  TrackLogoutOptions,
  TrackPageViewOptions,
  TrackItemReservationOptions,
  TrackWishlistCreatedOptions,
  TrackItemCreatedOptions,
  TrackWishlistViewOptions,
} from './types';
