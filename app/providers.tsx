'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../src/contexts/AuthContext';
import { AEPProvider, PageViewTracker } from '../src/components/aep/AEPProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/*
         * AEPProvider initializes Adobe Alloy (sets ECID cookie + device cookie).
         * PageViewTracker fires a page view event on every route change.
         * Both are placed inside AuthProvider so they have access to user state.
         */}
        <AEPProvider>
          <PageViewTracker />
          {children}
        </AEPProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: '12px',
              background: '#1a1a2e',
              color: '#fff',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#7c3aed', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
