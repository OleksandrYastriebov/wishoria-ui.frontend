/**
 * Injects Cloudinary resize/crop transformations into a Cloudinary URL.
 *
 * Inserts `w_{W},h_{H},c_fill` as a chained transformation immediately after
 * `/upload/` so the CDN serves an image that exactly matches the rendered
 * container — no over-fetching, no ugly browser-side stretching.
 *
 * Dimensions are rounded up to the nearest 100 px step so that a small
 * number of URL variants are generated (good for CDN cache hit-rate).
 * Device pixel ratio (capped at 2×) is factored in so retina screens get
 * crisp images.
 *
 * Non-Cloudinary URLs are returned as-is.
 */
export function withCloudinaryResize(
  url: string,
  cssWidth: number,
  cssHeight: number
): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;

  const uploadMarker = '/upload/';
  const uploadIdx = url.indexOf(uploadMarker);
  if (uploadIdx === -1) return url;

  const dpr = Math.min(typeof window !== 'undefined' ? (window.devicePixelRatio ?? 1) : 1, 2);
  const w = Math.ceil((cssWidth * dpr) / 100) * 100;
  const h = Math.ceil((cssHeight * dpr) / 100) * 100;

  const base = url.slice(0, uploadIdx + uploadMarker.length);
  const rest = url.slice(uploadIdx + uploadMarker.length);

  return `${base}w_${w},h_${h},c_fill/${rest}`;
}
