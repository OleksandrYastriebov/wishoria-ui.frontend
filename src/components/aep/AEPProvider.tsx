'use client';

/**
 * AEPProvider — initializes Adobe Alloy on first client-side mount.
 *
 * Must be placed inside <Providers> (which provides the AuthContext).
 * Initialization is a one-time side effect: safe to call in StrictMode.
 *
 * What happens on mount:
 *   1. Alloy is initialized (downloads SDK, configures with orgId + datastreamId)
 *   2. Adobe Edge Network sets the ECID cookie (amcv_ / kndctr_ cookies)
 *   3. The first-party device ID cookie (_wishoria_did) is created if missing
 *
 * The initial page view is sent by PageViewTracker (also in this file),
 * which waits for auth bootstrap to complete before firing — ensuring
 * the first page view carries the correct identity (authenticated or anonymous).
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initAlloy } from '../../lib/aep/alloy';
import { getOrCreateDeviceId } from '../../lib/aep/device';
import { trackPageView } from '../../lib/aep/events';
import { useAuthContext } from '../../contexts/AuthContext';
import type { PageType } from '../../lib/aep/types';

// ─── AEPProvider ──────────────────────────────────────────────────────────────

interface AEPProviderProps {
  children: React.ReactNode;
}

/**
 * Initializes Alloy once on mount.
 * Does not track events — that is PageViewTracker's responsibility.
 */
export function AEPProvider({ children }: AEPProviderProps) {
  useEffect(() => {
    // Initialize Alloy (sets ECID cookie, connects to Edge Network).
    // getOrCreateDeviceId() creates the _wishoria_did cookie on first visit.
    void initAlloy();
    getOrCreateDeviceId();
  }, []); // Run exactly once

  return <>{children}</>;
}

// ─── PageViewTracker ──────────────────────────────────────────────────────────

/**
 * Sends a page view event to AEP on every route change.
 *
 * Renders null — this is a pure side-effect component.
 * Place it once inside AEPProvider, wrapped in AuthProvider context.
 *
 * Tracking is deferred until isLoading=false to ensure the correct
 * identity state (anonymous vs authenticated) is included in the event.
 * This prevents a double-count: one anonymous + one authenticated page view
 * for the same initial page load.
 *
 * Dependencies:
 *   pathname  — re-fires on every Next.js route change
 *   isLoading — fires once after auth bootstrap completes
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const { user, isLoading } = useAuthContext();

  useEffect(() => {
    // Wait for auth bootstrap — we want the correct identity in the first event
    if (isLoading) return;

    const deviceId = getOrCreateDeviceId();
    const pageUrl = typeof window !== 'undefined' ? window.location.href : pathname;
    const pageName =
      typeof document !== 'undefined' && document.title ? document.title : pathname;

    void trackPageView({
      pageName,
      pageUrl,
      pageType: inferPageType(pathname),
      ...(user && {
        userId: user.id,
        email: user.email,
      }),
      deviceId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isLoading]);
  // Note: `user` intentionally excluded — we don't want to re-fire the page
  // view event when only the user object updates (e.g., profile edit).
  // The login trackLogin() in AuthContext handles the identity stitch.

  return null;
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/**
 * Maps a Next.js pathname to a Wishoria page type for XDM custom fields.
 * Used in both AEPProvider and any event that needs to classify the current page.
 */
export function inferPageType(pathname: string): PageType {
  if (pathname === '/') return 'landing';
  if (/^\/wishlists\/[^/]+/.test(pathname)) return 'wishlist_detail';
  if (pathname.startsWith('/wishlists')) return 'wishlists';
  if (pathname.startsWith('/profile')) return 'profile';
  if (/^\/(sign-in|sign-up|forgot-password|reset-password)/.test(pathname)) return 'auth';
  return 'other';
}
