import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Wishoria — Beautiful wishlists, made to share',
  icons: { icon: '/favicon.svg' },
  description:
    'Create and share beautiful wishlists for any occasion. With AI, secret coordination and elegant design.',
  openGraph: {
    siteName: 'Wishoria',
    type: 'website',
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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
