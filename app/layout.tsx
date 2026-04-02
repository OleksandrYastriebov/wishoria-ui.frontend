import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://wishoria.vercel.app'),
  title: 'Wishoria — Beautiful wishlists, made to share',
  icons: { icon: '/favicon.svg' },
  description:
    'Create and share beautiful wishlists for any occasion. With AI, secret coordination and elegant design.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    siteName: 'Wishoria',
    type: 'website',
    url: 'https://wishoria.vercel.app',
    title: 'Wishoria — Beautiful wishlists, made to share',
    description:
      'Create and share beautiful wishlists for any occasion. With AI, secret coordination and elegant design.',
  },
  twitter: {
    card: 'summary',
    title: 'Wishoria — Beautiful wishlists, made to share',
    description:
      'Create and share beautiful wishlists for any occasion. With AI, secret coordination and elegant design.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Adobe Alloy pre-init snippet — creates window.alloy queue synchronously
            so the AEP Assurance Chrome extension can hook in before async SDK load */}
        <Script id="alloy-prehook" strategy="beforeInteractive">{`
          !function(n,o){o.forEach(function(o){n[o]||((n.__alloyNS=n.__alloyNS||[]).push(o),n[o]=function(){var u=arguments;return new Promise(function(i,l){n[o].q.push([i,l,u])})},n[o].q=[])})}(window,["alloy"]);
        `}</Script>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
