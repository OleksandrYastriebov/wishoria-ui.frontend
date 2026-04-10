'use client';

import { useState, useEffect } from 'react';
import { initAlloy } from '../lib/aep/alloy';
import { buildAuthenticatedIdentityMap, buildAnonymousIdentityMap } from '../lib/aep/identity';
import { getOrCreateDeviceId } from '../lib/aep/device';
import type { AJOProposition, AlloyEventResult } from '../lib/aep/types';

interface BannerUser {
  id: string | number;
  email: string;
}

/**
 * Fetches an AJO Code-Based Experience proposition for the given page path.
 *
 * WHY custom code is needed:
 * Alloy auto-renders only Adobe Target VEC propositions (DOM patches).
 * For AJO Code-Based Experience, Alloy returns raw HTML/JSON content in
 * propositions[].items[].data.content — but doesn't know which DOM container
 * to inject it into. That part is always the developer's responsibility.
 *
 * Surface URI format: `web://hostname/path`
 */
export function useAJOBanner(path: string, user?: BannerUser): { html: string | null; isLoading: boolean } {
  const [html, setHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (typeof window === 'undefined') { setIsLoading(false); return; }

      const alloy = await initAlloy();
      if (!alloy) { setIsLoading(false); return; }

      const surface =
        process.env.NEXT_PUBLIC_AEP_WISHLISTS_SURFACE ??
        `web://${window.location.host}${path}`;

      const deviceId = getOrCreateDeviceId();
      const identityMap = user
        ? buildAuthenticatedIdentityMap(user.id, user.email, deviceId)
        : buildAnonymousIdentityMap(deviceId);

      try {
        const result = (await alloy('sendEvent', {
          renderDecisions: true,
          xdm: { identityMap },
          personalization: { surfaces: [surface] },
        })) as AlloyEventResult;

        if (cancelled) return;
        setHtml(extractHtml(result?.propositions ?? []));
      } catch (err) {
        console.error('[AEP] useAJOBanner failed:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [path, user?.id]);

  return { html, isLoading };
}

const DOM_ACTION_SCHEMA = 'https://ns.adobe.com/personalization/dom-action';
const HTML_CONTENT_SCHEMA = 'https://ns.adobe.com/personalization/html-content-item';
const JSON_CONTENT_SCHEMA = 'https://ns.adobe.com/personalization/json-content-item';

function extractHtml(propositions: AJOProposition[]): string | null {
  for (const proposition of propositions) {
    for (const item of proposition.items ?? []) {
      const schema = item.schema ?? '';
      const content = item.data?.content;

      if (schema === DOM_ACTION_SCHEMA) {
        // Web channel (VEC): only setHtml actions carry the actual banner text
        if (item.data?.type !== 'setHtml') continue;
        if (typeof content === 'string' && content) return content;
        continue;
      }

      if (schema === HTML_CONTENT_SCHEMA) {
        if (typeof content === 'string' && content) return content;
        continue;
      }

      if (schema === JSON_CONTENT_SCHEMA) {
        if (typeof content !== 'string' || !content) continue;
        try {
          const parsed = JSON.parse(content) as Record<string, unknown>;
          if (typeof parsed.html === 'string') return parsed.html;
        } catch { /* ignore */ }
        continue;
      }

      // Fallback for unknown schemas
      if (typeof content !== 'string' || !content) continue;
      try {
        const parsed = JSON.parse(content) as Record<string, unknown>;
        if (typeof parsed.html === 'string') return parsed.html;
      } catch { /* not JSON — treat as raw HTML */ }
      return content;
    }
  }
  return null;
}
