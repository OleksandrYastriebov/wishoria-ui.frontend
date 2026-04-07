'use client';

import { useState, useEffect } from 'react';
import { getAlloy } from '../lib/aep/alloy';
import type { AJOProposition, AlloyEventResult } from '../lib/aep/types';

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
export function useAJOBanner(path: string): { html: string | null; isLoading: boolean } {
  const [html, setHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (typeof window === 'undefined') { setIsLoading(false); return; }

      const alloy = getAlloy();
      if (!alloy) { setIsLoading(false); return; }

      const surface =
        process.env.NEXT_PUBLIC_AEP_WISHLISTS_SURFACE ??
        `web://${window.location.host}${path}`;

      try {
        const result = (await alloy('sendEvent', {
          renderDecisions: true,
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
  }, [path]);

  return { html, isLoading };
}

function extractHtml(propositions: AJOProposition[]): string | null {
  for (const proposition of propositions) {
    for (const item of proposition.items ?? []) {
      const raw = item.data?.content;
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        if (typeof parsed.html === 'string') return parsed.html;
      } catch {
        // not JSON — treat as raw HTML
      }
      return raw;
    }
  }
  return null;
}
