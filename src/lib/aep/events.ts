/**
 * High-level AEP event tracking functions.
 *
 * This is the primary API consumed by components and hooks.
 * All functions are async and fail silently — import and call them anywhere
 * without try/catch, they will never propagate errors to the caller.
 *
 * QUICK REFERENCE:
 *   trackPageView()  — call on every route change (via useAEPPageView hook)
 *   trackLogin()     — call immediately after successful authentication
 *   trackLogout()    — call before/after clearing auth state
 *
 * EXTENDING THIS FILE:
 *   To add a new event (e.g., wishlist created, item checked):
 *   1. Add a new XDMEventType value to types.ts if needed
 *   2. Create a new function here following the same pattern
 *   3. Export it from index.ts
 *   4. Optionally add a corresponding hook in src/hooks/
 */

import { sendAEPEvent } from './alloy';
import { getDeviceId } from './device';
import {
  buildAnonymousIdentityMap,
  buildAuthenticatedIdentityMap,
  buildLoggedOutIdentityMap,
} from './identity';
import type {
  TrackLoginOptions,
  TrackLogoutOptions,
  TrackPageViewOptions,
  TrackItemReservationOptions,
  TrackWishlistCreatedOptions,
  TrackItemCreatedOptions,
  TrackWishlistViewOptions,
  PageType,
  WishoriaXDMEvent,
} from './types';

function getPriceRange(price: number | null | undefined): 'none' | 'low' | 'medium' | 'high' {
  if (price == null) return 'none';
  if (price < 50) return 'low';
  if (price <= 200) return 'medium';
  return 'high';
}

// ─── Page Views ───────────────────────────────────────────────────────────────

/**
 * Tracks a page view event.
 *
 * Should be called on every route change. The useAEPPageView hook handles
 * this automatically — you rarely need to call this function directly.
 *
 * Sends renderDecisions=true so AEP can respond with personalization content
 * from Adobe Target or Adobe Journey Optimizer In-App Messages.
 *
 * Identity logic:
 *   - If user is authenticated: sends full identity map (CRMID + Email + DEVICE)
 *   - If anonymous: sends only DEVICE identity map
 *   - If no deviceId: sends no identityMap (ECID alone is still captured by Alloy)
 */
export async function trackPageView(options: TrackPageViewOptions): Promise<void> {
  const { pageName, pageUrl, pageType, userId, email, deviceId } = options;

  const identityMap =
    userId && email && deviceId
      ? buildAuthenticatedIdentityMap(userId, email, deviceId)
      : deviceId
      ? buildAnonymousIdentityMap(deviceId)
      : undefined;

  const xdm: WishoriaXDMEvent = {
    eventType: 'web.webpagedetails.pageViews',
    timestamp: new Date().toISOString(),
    identityMap,
    web: {
      webPageDetails: {
        name: pageName,
        URL: pageUrl,
      },
    },
    _devhandlerptrsd: {
      wishoria: {
        pageType,
        ...(userId != null && { userId: String(userId) }),
        ...(email && { userEmail: email }),
      },
    },
  };

  await sendAEPEvent(xdm, /* renderDecisions= */ true);
}

// ─── Authentication ───────────────────────────────────────────────────────────

/**
 * Tracks a successful login and stitches the user's identity graph.
 *
 * This is the most important event for AEP identity resolution. When sent:
 *   1. AEP's Identity Service receives: CRMID + Email + WISHORIA_DEVICE
 *   2. It looks up if any of these exist in the identity graph
 *   3. If ECID already exists (from anonymous visit), it links ECID → CRMID
 *   4. All prior anonymous events (page views, clicks) become attributed to this user
 *
 * Call this after the backend confirms login AND after setUser() completes
 * (so you have the full UserProfileDto with id and email).
 *
 * @example
 *   const me = await getMe();
 *   setUser(me);
 *   await trackLogin({ userId: me.id, email: me.email, deviceId });
 */
export async function trackLogin(options: TrackLoginOptions): Promise<void> {
  const { userId, email, deviceId } = options;

  const xdm: WishoriaXDMEvent = {
    eventType: 'userAccount.login',
    timestamp: new Date().toISOString(),
    identityMap: buildAuthenticatedIdentityMap(userId, email, deviceId),
    web: {
      webPageDetails: {
        name: 'Login',
        URL: typeof window !== 'undefined' ? window.location.href : '',
      },
    },
    _devhandlerptrsd: {
      wishoria: {
        userId: String(userId),
        userEmail: email,
        pageType: 'auth',
      },
    },
  };

  await sendAEPEvent(xdm);
}

/**
 * Tracks a user logout event.
 *
 * Sends identity with authenticatedState="loggedOut" for all namespaces.
 * This signals to AEP Journey analytics that the session has ended.
 * The identity graph itself is NOT deleted — AEP retains all associations
 * for future re-identification (next login).
 *
 * Call this before clearAuth() so you still have user data available.
 *
 * @example
 *   if (user) await trackLogout({ userId: user.id, email: user.email });
 *   clearAuth();
 */
export async function trackLogout(options: TrackLogoutOptions): Promise<void> {
  const { userId, email } = options;
  const deviceId = getDeviceId() ?? '';

  const xdm: WishoriaXDMEvent = {
    eventType: 'userAccount.logout',
    timestamp: new Date().toISOString(),
    identityMap: buildLoggedOutIdentityMap(userId, email, deviceId),
    web: {
      webPageDetails: {
        name: 'Logout',
        URL: typeof window !== 'undefined' ? window.location.href : '',
      },
    },
    _devhandlerptrsd: {
      wishoria: {
        userId: String(userId),
        userEmail: email,
        pageType: 'auth',
      },
    },
  };

  await sendAEPEvent(xdm);
}

// ─── Wishlist & Item Events ───────────────────────────────────────────────────

/**
 * Tracks wishlist creation (manual or AI-generated).
 * Call after the backend confirms the wishlist was created.
 */
export async function trackWishlistCreated(options: TrackWishlistCreatedOptions): Promise<void> {
  const { wishlistId, userId, email, isAiGenerated, isPublic, hasImage } = options;
  const deviceId = getDeviceId() ?? '';

  const identityMap =
    userId && email && deviceId
      ? buildAuthenticatedIdentityMap(userId, email, deviceId)
      : deviceId
      ? buildAnonymousIdentityMap(deviceId)
      : undefined;

  const xdm: WishoriaXDMEvent = {
    eventType: isAiGenerated ? 'wishlist.aiGenerated' : 'wishlist.created',
    timestamp: new Date().toISOString(),
    identityMap,
    web: {
      webPageDetails: {
        name: 'My Wishlists',
        URL: typeof window !== 'undefined' ? window.location.href : '',
      },
    },
    _devhandlerptrsd: {
      wishoria: {
        wishlistId,
        pageType: 'wishlists',
        ...(isPublic != null && { wishlistVisibility: isPublic ? 'public' : 'private' }),
        ...(hasImage != null && { wishlistHasImage: hasImage }),
        ...(userId != null && { userId: String(userId) }),
        ...(email && { userEmail: email }),
      },
    },
  };

  await sendAEPEvent(xdm);
}

/**
 * Tracks wishlist item creation.
 * Call after the backend confirms the item was created.
 */
export async function trackItemCreated(options: TrackItemCreatedOptions): Promise<void> {
  const { wishlistId, itemId, userId, email, price, hasUrl, hasImage, hasDescription } = options;
  const deviceId = getDeviceId() ?? '';

  const identityMap =
    userId && email && deviceId
      ? buildAuthenticatedIdentityMap(userId, email, deviceId)
      : deviceId
      ? buildAnonymousIdentityMap(deviceId)
      : undefined;

  const xdm: WishoriaXDMEvent = {
    eventType: 'wishlist.item.created',
    timestamp: new Date().toISOString(),
    identityMap,
    web: {
      webPageDetails: {
        name: `Wishlist ${wishlistId}`,
        URL: typeof window !== 'undefined' ? window.location.href : '',
      },
    },
    _devhandlerptrsd: {
      wishoria: {
        wishlistId,
        wishlistItemId: itemId,
        pageType: 'wishlist_detail',
        itemHasPrice: price != null,
        itemPriceRange: getPriceRange(price),
        ...(hasUrl != null && { itemHasUrl: hasUrl }),
        ...(hasImage != null && { itemHasImage: hasImage }),
        ...(hasDescription != null && { itemHasDescription: hasDescription }),
        ...(userId != null && { userId: String(userId) }),
        ...(email && { userEmail: email }),
      },
    },
  };

  await sendAEPEvent(xdm);
}

/**
 * Tracks item reservation toggle (reserve / unreserve).
 * Call after the backend confirms the toggle.
 */
export async function trackItemReservation(options: TrackItemReservationOptions): Promise<void> {
  const { wishlistId, itemId, isReserved, userId, email, price, hasUrl, hasImage, hasDescription } = options;
  const deviceId = getDeviceId() ?? '';

  const identityMap =
    userId && email && deviceId
      ? buildAuthenticatedIdentityMap(userId, email, deviceId)
      : deviceId
      ? buildAnonymousIdentityMap(deviceId)
      : undefined;

  const xdm: WishoriaXDMEvent = {
    eventType: isReserved ? 'wishlist.item.reserved' : 'wishlist.item.unreserved',
    timestamp: new Date().toISOString(),
    identityMap,
    web: {
      webPageDetails: {
        name: `Wishlist ${wishlistId}`,
        URL: typeof window !== 'undefined' ? window.location.href : '',
      },
    },
    _devhandlerptrsd: {
      wishoria: {
        wishlistId,
        wishlistItemId: itemId,
        pageType: 'wishlist_detail',
        itemHasPrice: price != null,
        itemPriceRange: getPriceRange(price),
        ...(hasUrl != null && { itemHasUrl: hasUrl }),
        ...(hasImage != null && { itemHasImage: hasImage }),
        ...(hasDescription != null && { itemHasDescription: hasDescription }),
        ...(userId != null && { userId: String(userId) }),
        ...(email && { userEmail: email }),
      },
    },
  };

  await sendAEPEvent(xdm);
}

/**
 * Tracks when a user views a wishlist.
 */
export async function trackWishlistView(options: TrackWishlistViewOptions): Promise<void> {
  const { wishlistId, userId, email, isPublic, hasImage } = options;
  const deviceId = getDeviceId() ?? '';

  const identityMap =
    userId && email && deviceId
      ? buildAuthenticatedIdentityMap(userId, email, deviceId)
      : deviceId
      ? buildAnonymousIdentityMap(deviceId)
      : undefined;

  const xdm: WishoriaXDMEvent = {
    eventType: 'commerce.productListOpens',
    timestamp: new Date().toISOString(),
    identityMap,
    web: {
      webPageDetails: {
        name: `Wishlist ${wishlistId}`,
        URL: typeof window !== 'undefined' ? window.location.href : '',
      },
    },
    _devhandlerptrsd: {
      wishoria: {
        wishlistId,
        pageType: 'wishlist_detail',
        ...(isPublic != null && { wishlistVisibility: isPublic ? 'public' : 'private' }),
        ...(hasImage != null && { wishlistHasImage: hasImage }),
        ...(userId != null && { userId: String(userId) }),
        ...(email && { userEmail: email }),
      },
    },
  };

  await sendAEPEvent(xdm);
}
