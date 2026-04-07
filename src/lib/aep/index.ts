export { initAlloy, sendAEPEvent, getECID, getAlloy } from './alloy';
export { ingestProfile } from './ingest';
export type { IngestProfilePayload } from './ingest';
export {
  trackPageView,
  trackLogin,
  trackLogout,
  trackWishlistView,
  trackWishlistCreated,
  trackWishlistClicked,
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
  WishoriaXDMTenantFields,
  XDMEventType,
  PageType,
  TrackLoginOptions,
  TrackLogoutOptions,
  TrackPageViewOptions,
  TrackItemReservationOptions,
  TrackWishlistCreatedOptions,
  TrackItemCreatedOptions,
  TrackWishlistViewOptions,
  TrackWishlistClickedOptions,
} from './types';
