import { sendAEPEvent, resolveDatastreamId } from './alloy';
import { getDeviceId } from './device';
import {
  buildAnonymousIdentityMap,
  buildAuthenticatedIdentityMap,
  buildLoggedOutIdentityMap,
  buildRegistrationIdentityMap,
} from './identity';
import type {
  TrackSignUpOptions,
  TrackLoginOptions,
  TrackLogoutOptions,
  TrackPageViewOptions,
  TrackItemReservationOptions,
  TrackWishlistCreatedOptions,
  TrackItemCreatedOptions,
  TrackWishlistViewOptions,
  TrackWishlistClickedOptions,
  IdentityMap,
  UserContextFields,
  WishoriaXDMEvent,
} from './types';

// ─── Registration → Auth Datastream ──────────────────────────────────────────

export async function trackSignUp(options: TrackSignUpOptions): Promise<void> {
  const { email, firstName, lastName, deviceId } = options;

  const dedupKey = `aep_signup:${email}`;
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(dedupKey)) return;

  const xdm: WishoriaXDMEvent = {
    eventType: 'userAccount.createProfile',
    timestamp: new Date().toISOString(),
    // Email is primary at registration — no CRMID yet (API returns void, userId unknown)
    identityMap: buildRegistrationIdentityMap(email, deviceId),
    web: { webPageDetails: { name: 'Sign Up', URL: currentUrl() } },
    _adobequaptrsd: {
      user: { userEmail: email, isWishoriaUser: true },
      auth: { loginMethod: 'email' },
      page: { pageType: 'auth' },
    },
  };

  const profileData = { firstName, lastName, email };

  await sendAEPEvent(xdm, false, resolveDatastreamId('auth'), profileData);

  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(dedupKey, '1');
  }
}

// ─── Page Views → PageView Datastream ────────────────────────────────────────

export async function trackPageView(options: TrackPageViewOptions): Promise<void> {
  const { pageName, pageUrl, pageType, userId, email, deviceId } = options;

  const xdm: WishoriaXDMEvent = {
    eventType: 'web.webpagedetails.pageViews',
    timestamp: new Date().toISOString(),
    identityMap: resolveIdentityMap(userId, email, deviceId ?? ''),
    web: { webPageDetails: { name: pageName, URL: pageUrl } },
    _adobequaptrsd: {
      user: userFields(userId, email),
      page: { pageType },
    },
  };

  await sendAEPEvent(xdm, /* renderDecisions= */ true, resolveDatastreamId('pageView'));
}

// ─── Authentication → Auth Datastream ────────────────────────────────────────

export async function trackLogin(options: TrackLoginOptions): Promise<void> {
  const { userId, email, deviceId } = options;

  const xdm: WishoriaXDMEvent = {
    eventType: 'userAccount.login',
    timestamp: new Date().toISOString(),
    identityMap: buildAuthenticatedIdentityMap(userId, email, deviceId),
    web: { webPageDetails: { name: 'Login', URL: currentUrl() } },
    _adobequaptrsd: {
      user: { userId: String(userId), userEmail: email },
      auth: { loginMethod: 'email' },
      page: { pageType: 'auth' },
    },
  };

  await sendAEPEvent(xdm, false, resolveDatastreamId('auth'));
}

export async function trackLogout(options: TrackLogoutOptions): Promise<void> {
  const { userId, email } = options;
  const deviceId = getDeviceId() ?? '';

  const xdm: WishoriaXDMEvent = {
    eventType: 'userAccount.logout',
    timestamp: new Date().toISOString(),
    identityMap: buildLoggedOutIdentityMap(userId, email, deviceId),
    web: { webPageDetails: { name: 'Logout', URL: currentUrl() } },
    _adobequaptrsd: {
      user: { userId: String(userId), userEmail: email },
      auth: { loginMethod: 'email' },
      page: { pageType: 'auth' },
    },
  };

  await sendAEPEvent(xdm, false, resolveDatastreamId('auth'));
}

// ─── Wishlist & Item Events → Wishlist Datastream ─────────────────────────────

export async function trackWishlistCreated(options: TrackWishlistCreatedOptions): Promise<void> {
  const { wishlistId, userId, email, isAiGenerated, isPublic, hasImage } = options;
  const deviceId = getDeviceId() ?? '';

  const xdm: WishoriaXDMEvent = {
    eventType: isAiGenerated ? 'wishlist.aiGenerated' : 'wishlist.created',
    timestamp: new Date().toISOString(),
    identityMap: resolveIdentityMap(userId, email, deviceId),
    web: { webPageDetails: { name: 'My Wishlists', URL: currentUrl() } },
    _adobequaptrsd: {
      user: userFields(userId, email),
      wishlist: {
        wishlistId,
        ...(isPublic != null && { wishlistVisibility: isPublic ? 'public' : 'private' }),
        ...(hasImage != null && { wishlistHasImage: hasImage }),
        ...(isAiGenerated != null && { isAiGenerated }),
      },
      page: { pageType: 'wishlists' },
    },
  };

  await sendAEPEvent(xdm, false, resolveDatastreamId('wishlist'));
}

export async function trackWishlistView(options: TrackWishlistViewOptions): Promise<void> {
  const { wishlistId, userId, email, isPublic, hasImage } = options;
  const deviceId = getDeviceId() ?? '';

  const xdm: WishoriaXDMEvent = {
    eventType: 'commerce.productListOpens',
    timestamp: new Date().toISOString(),
    identityMap: resolveIdentityMap(userId, email, deviceId),
    web: { webPageDetails: { name: `Wishlist ${wishlistId}`, URL: currentUrl() } },
    _adobequaptrsd: {
      user: userFields(userId, email),
      wishlist: {
        wishlistId,
        ...(isPublic != null && { wishlistVisibility: isPublic ? 'public' : 'private' }),
        ...(hasImage != null && { wishlistHasImage: hasImage }),
      },
      page: { pageType: 'wishlist_detail' },
    },
  };

  await sendAEPEvent(xdm, false, resolveDatastreamId('wishlist'));
}

export async function trackWishlistClicked(options: TrackWishlistClickedOptions): Promise<void> {
  const { wishlistId, wishlistTitle, isPublic, hasImage, userId, email } = options;
  const deviceId = getDeviceId() ?? '';

  const xdm: WishoriaXDMEvent = {
    eventType: 'wishlist.clicked',
    timestamp: new Date().toISOString(),
    identityMap: resolveIdentityMap(userId, email, deviceId),
    web: {
      webInteraction: {
        name: wishlistTitle,
        type: 'other',
        URL: typeof window !== 'undefined' ? `${window.location.origin}/wishlists/${wishlistId}` : '',
        linkClicks: { value: 1 },
      },
    },
    _adobequaptrsd: {
      user: userFields(userId, email),
      wishlist: {
        wishlistId,
        ...(isPublic != null && { wishlistVisibility: isPublic ? 'public' : 'private' }),
        ...(hasImage != null && { wishlistHasImage: hasImage }),
      },
      page: { pageType: 'wishlists' },
    },
  };

  await sendAEPEvent(xdm, false, resolveDatastreamId('wishlist'));
}

export async function trackItemCreated(options: TrackItemCreatedOptions): Promise<void> {
  const { wishlistId, itemId, userId, email, price, hasUrl, hasImage, hasDescription } = options;
  const deviceId = getDeviceId() ?? '';

  const xdm: WishoriaXDMEvent = {
    eventType: 'wishlist.item.created',
    timestamp: new Date().toISOString(),
    identityMap: resolveIdentityMap(userId, email, deviceId),
    web: { webPageDetails: { name: `Wishlist ${wishlistId}`, URL: currentUrl() } },
    _adobequaptrsd: {
      user: userFields(userId, email),
      wishlistItem: {
        wishlistId,
        wishlistItemId: itemId,
        itemHasPrice: price != null,
        itemPriceRange: getPriceRange(price),
        ...(hasUrl != null && { itemHasUrl: hasUrl }),
        ...(hasImage != null && { itemHasImage: hasImage }),
        ...(hasDescription != null && { itemHasDescription: hasDescription }),
      },
      page: { pageType: 'wishlist_detail' },
    },
  };

  await sendAEPEvent(xdm, false, resolveDatastreamId('wishlist'));
}

export async function trackItemReservation(options: TrackItemReservationOptions): Promise<void> {
  const { wishlistId, itemId, isReserved, userId, email, price, hasUrl, hasImage, hasDescription } = options;
  const deviceId = getDeviceId() ?? '';

  const xdm: WishoriaXDMEvent = {
    eventType: isReserved ? 'wishlist.item.reserved' : 'wishlist.item.unreserved',
    timestamp: new Date().toISOString(),
    identityMap: resolveIdentityMap(userId, email, deviceId),
    web: { webPageDetails: { name: `Wishlist ${wishlistId}`, URL: currentUrl() } },
    _adobequaptrsd: {
      user: userFields(userId, email),
      wishlistItem: {
        wishlistId,
        wishlistItemId: itemId,
        itemHasPrice: price != null,
        itemPriceRange: getPriceRange(price),
        ...(hasUrl != null && { itemHasUrl: hasUrl }),
        ...(hasImage != null && { itemHasImage: hasImage }),
        ...(hasDescription != null && { itemHasDescription: hasDescription }),
      },
      page: { pageType: 'wishlist_detail' },
    },
  };

  await sendAEPEvent(xdm, false, resolveDatastreamId('wishlist'));
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function currentUrl(): string {
  return typeof window !== 'undefined' ? window.location.href : '';
}

function resolveIdentityMap(
  userId: string | number | null | undefined,
  email: string | undefined,
  deviceId: string
): IdentityMap | undefined {
  if (userId && email && deviceId) return buildAuthenticatedIdentityMap(userId, email, deviceId);
  if (deviceId) return buildAnonymousIdentityMap(deviceId);
  return undefined;
}

function userFields(
  userId: string | number | null | undefined,
  email: string | undefined
): UserContextFields {
  return {
    isWishoriaUser: true,
    ...(userId != null && { userId: String(userId) }),
    ...(email && { userEmail: email }),
  };
}

function getPriceRange(price: number | null | undefined): 'none' | 'low' | 'medium' | 'high' {
  if (price == null) return 'none';
  if (price < 50) return 'low';
  if (price <= 200) return 'medium';
  return 'high';
}
