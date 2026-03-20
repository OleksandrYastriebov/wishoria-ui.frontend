import type { Metadata } from 'next';
import WishlistDetailPage from '../../../../src/views/WishlistDetailPage';

const BACKEND_URL = process.env.BACKEND_URL ?? 'https://notionary-8oyd.onrender.com';

function toOgImageUrl(url: string): string {
  if (!url.includes('res.cloudinary.com')) return url;
  const uploadMarker = '/upload/';
  const idx = url.indexOf(uploadMarker);
  if (idx === -1) return url;
  const base = url.slice(0, idx + uploadMarker.length);
  const rest = url.slice(idx + uploadMarker.length);
  return `${base}w_1200,h_630,c_fill/${rest}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ wishlistId: string }>;
}): Promise<Metadata> {
  const { wishlistId } = await params;

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/wishlists/${wishlistId}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return {};

    const wishlist = (await res.json()) as {
      title: string;
      wishListItems: unknown[];
      imageUrl: string | null;
    };

    const itemCount = Array.isArray(wishlist.wishListItems)
      ? wishlist.wishListItems.length
      : 0;
    const ogImage = wishlist.imageUrl ? toOgImageUrl(wishlist.imageUrl) : undefined;
    const description = `${itemCount} ${itemCount === 1 ? 'item' : 'items'} · Wishlist on Wishoria`;

    return {
      title: `${wishlist.title} · Wishoria`,
      description,
      openGraph: {
        title: `${wishlist.title} · Wishoria`,
        description,
        images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : [],
      },
      twitter: {
        card: ogImage ? 'summary_large_image' : 'summary',
        title: `${wishlist.title} · Wishoria`,
        description,
        ...(ogImage ? { images: [ogImage] } : {}),
      },
    };
  } catch {
    return {};
  }
}

export default WishlistDetailPage;
