// ─── Alloy SDK ────────────────────────────────────────────────────────────────

export type AlloyInstance = (
  command: string,
  options?: Record<string, unknown>
) => Promise<unknown>;

// ─── Configuration ────────────────────────────────────────────────────────────

export interface AEPConfig {
  orgId: string;
  datastreamId: string;
  datastreamIds: {
    auth: string;
    wishlist: string;
    pageView: string;
  };
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

/** Shared user context — attached to any event with a known user */
export interface UserContextFields {
  userId?: string;
  userEmail?: string;
}

/** Auth domain — userAccount.login, userAccount.logout, userAccount.createProfile */
export interface AuthEventFields {
  loginMethod?: 'email' | 'google' | 'facebook';
}

/** Wishlist lifecycle — wishlist.created, wishlist.aiGenerated, commerce.productListOpens */
export interface WishlistEventFields {
  wishlistId?: string;
  wishlistVisibility?: 'public' | 'private';
  wishlistHasImage?: boolean;
  isAiGenerated?: boolean;
}

/** Wishlist item — wishlist.item.created, wishlist.item.reserved, wishlist.item.unreserved */
export interface WishlistItemEventFields {
  wishlistId?: string;
  wishlistItemId?: string;
  itemHasPrice?: boolean;
  itemPriceRange?: 'none' | 'low' | 'medium' | 'high';
  itemHasUrl?: boolean;
  itemHasImage?: boolean;
  itemHasDescription?: boolean;
}

/** Page context — attached to every event for funnel analysis */
export interface PageContextFields {
  pageType?: PageType;
}

export type PageType =
  | 'landing'
  | 'wishlists'
  | 'wishlist_detail'
  | 'profile'
  | 'auth'
  | 'other';

/** Tenant namespace object — key must match the sandbox tenant (_adobequaptrsd) */
export interface WishoriaXDMTenantFields {
  user?: UserContextFields;
  auth?: AuthEventFields;
  wishlist?: WishlistEventFields;
  wishlistItem?: WishlistItemEventFields;
  page?: PageContextFields;
}

// ─── XDM Event ────────────────────────────────────────────────────────────────

export interface WishoriaXDMEvent {
  eventType: XDMEventType;
  timestamp?: string;

  identityMap?: IdentityMap;
  web?: {
    webPageDetails?: WebPageDetails;
    webInteraction?: WebInteraction;
  };
  _adobequaptrsd?: WishoriaXDMTenantFields;
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
  | 'wishlist.item.unreserved'
  | 'wishlist.clicked';

// ─── Helper result types ──────────────────────────────────────────────────────

/** Shape of the object returned by alloy("getIdentity") */
export interface AlloyIdentityResult {
  identity: {
    ECID: string;
  };
}

// ─── AJO Personalization / Propositions ──────────────────────────────────────

export interface AJOPropositionItemData {
  id?: string;
  format?: string;
  /** Raw content — HTML string, JSON string, or DOM action content depending on campaign config */
  content?: string;
  /** DOM action type — only present for web://  (dom-action schema) campaigns */
  type?: 'insertBefore' | 'insertAfter' | 'setHtml' | 'setStyle' | 'setAttribute' | 'remove';
  /** CSS selector — only present for dom-action schema */
  selector?: string;
  /** Pre-hiding selector — only present for dom-action schema */
  prehidingSelector?: string;
}

export interface AJOPropositionItem {
  id: string;
  schema: string;
  data: AJOPropositionItemData;
}

export interface AJOProposition {
  id: string;
  scope: string;
  items: AJOPropositionItem[];
  scopeDetails: Record<string, unknown>;
}

export interface AlloyEventResult {
  propositions?: AJOProposition[];
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

export interface TrackWishlistClickedOptions {
  wishlistId: string;
  wishlistTitle: string;
  isPublic?: boolean;
  hasImage?: boolean;
  userId?: string | number | null;
  email?: string;
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
