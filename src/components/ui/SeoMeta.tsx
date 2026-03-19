import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Wishoria';
const DEFAULT_DESCRIPTION =
  'Create and share beautiful wishlists for any occasion. With AI, secret coordination and elegant design.';

interface SeoMetaProps {
  title?: string;
  description?: string;
  image?: string | null;
  type?: 'website' | 'article';
}

function toOgImage(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (!url.includes('res.cloudinary.com')) return url;

  const uploadMarker = '/upload/';
  const idx = url.indexOf(uploadMarker);
  if (idx === -1) return url;

  const base = url.slice(0, idx + uploadMarker.length);
  const rest = url.slice(idx + uploadMarker.length);
  return `${base}w_1200,h_630,c_fill/${rest}`;
}

export function SeoMeta({ title, description, image, type = 'website' }: SeoMetaProps) {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — Beautiful wishlists, made to share`;
  const desc = description ?? DEFAULT_DESCRIPTION;
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const ogImage = toOgImage(image);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta property="og:image:width" content="1200" />}
      {ogImage && <meta property="og:image:height" content="630" />}

      {/* Twitter / X */}
      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
}
