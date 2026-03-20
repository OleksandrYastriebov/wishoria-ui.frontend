import type { Metadata } from 'next';
import LandingPage from '../src/views/LandingPage';

export const metadata: Metadata = {
  title: 'Wishoria — Beautiful wishlists, made to share',
  description:
    'Create and share beautiful wishlists for any occasion. With AI, secret coordination and elegant design.',
  openGraph: {
    title: 'Wishoria — Beautiful wishlists, made to share',
    description:
      'Create and share beautiful wishlists for any occasion. With AI, secret coordination and elegant design.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Wishoria — Beautiful wishlists, made to share',
    description:
      'Create and share beautiful wishlists for any occasion. With AI, secret coordination and elegant design.',
  },
};

export default LandingPage;
