// ─── Alloy SDK ────────────────────────────────────────────────────────────────

export type AlloyInstance = (
  command: string,
  options?: Record<string, unknown>
) => Promise<unknown>;

// ─── Configuration ────────────────────────────────────────────────────────────

export interface AEPConfig {
  orgId: string;
  datastreamId: string;
  edgeDomain: string;
  debugEnabled: boolean;
}

// ─── Identity Map ─────────────────────────────────────────────────────────────

export interface IdentityMapEntry {
  id: string;
  primary: boolean;
  authenticatedState: 'ambiguous' | 'authenticated' | 'loggedOut';
}

export type IdentityMap = Record<string, IdentityMapEntry[]>;

// ─── XDM Web Fields ──────────────────────────────────────────────────────────

export interface WebPageDetails {
  name: string;
  URL: string;
}

export interface WebInteraction {
  name: string;
  type: 'download' | 'exit' | 'other';
  URL?: string;
  linkClicks?: { value: 1 };
}

// ─── Custom Wishoria XDM Fields ───────────────────────────────────────────────

export interface WishoriaCustomFields {
  userId?: string;
  userEmail?: string;
  wishlistId?: string;
  wishlistVisibility?: 'public' | 'private';
  wishlistHasImage?: boolean;
  wishlistItemId?: string;
  itemHasPrice?: boolean;
  itemPriceRange?: 'none' | 'low' | 'medium' | 'high';
  itemHasUrl?: boolean;
  itemHasImage?: boolean;
  itemHasDescription?: boolean;
  pageType?: PageType;
}

export type PageType =
  | 'landing'
  | 'wishlists'
  | 'wishlist_detail'
  | 'profile'
  | 'auth'
  | 'other';

// ─── XDM Event ────────────────────────────────────────────────────────────────


export interface WishoriaXDMEvent {
  eventType: XDMEventType;
  timestamp?: string;

  identityMap?: IdentityMap;
  web?: {
    webPageDetails?: WebPageDetails;
    webInteraction?: WebInteraction;
  };
  _devhandlerptrsd?: {
    wishoria?: WishoriaCustomFields;
  };
}

export type XDMEventType =
  | 'web.webpagedetails.pageViews'
  | 'web.webInteraction.linkClicks'
  | 'userAccount.login'
  | 'userAccount.logout'
  | 'userAccount.createProfile'
  | 'commerce.productListOpens'
  | 'commerce.productListAdds'
  | 'commerce.saveForLaters'
  | 'wishlist.created'
  | 'wishlist.aiGenerated'
  | 'wishlist.item.created'
  | 'wishlist.item.reserved'
  | 'wishlist.item.unreserved';

// ─── Helper result types ──────────────────────────────────────────────────────

/** Shape of the object returned by alloy("getIdentity") */
export interface AlloyIdentityResult {
  identity: {
    ECID: string;
  };
}

// ─── Event option interfaces ──────────────────────────────────────────────────

export interface TrackLoginOptions {
  userId: string | number;
  email: string;
  deviceId: string;
}

export interface TrackLogoutOptions {
  userId: string | number;
  email: string;
}

export interface TrackPageViewOptions {
  pageName: string;
  pageUrl: string;
  pageType: PageType;
  userId?: string | number;
  email?: string;
  deviceId?: string;
}

export interface TrackItemReservationOptions {
  wishlistId: string;
  itemId: string;
  itemTitle: string;
  isReserved: boolean;
  userId?: string | number | null;
  email?: string;
  price?: number | null;
  hasUrl?: boolean;
  hasImage?: boolean;
  hasDescription?: boolean;
}

export interface TrackWishlistViewOptions {
  wishlistId: string;
  userId?: string | number;
  email?: string;
  pageType?: PageType;
  isPublic?: boolean;
  hasImage?: boolean;
}

export interface TrackWishlistCreatedOptions {
  wishlistId: string;
  userId?: string | number | null;
  email?: string;
  isAiGenerated?: boolean;
  isPublic?: boolean;
  hasImage?: boolean;
}

export interface TrackItemCreatedOptions {
  wishlistId: string;
  itemId: string;
  userId?: string | number | null;
  email?: string;
  price?: number | null;
  hasUrl?: boolean;
  hasImage?: boolean;
  hasDescription?: boolean;
}
