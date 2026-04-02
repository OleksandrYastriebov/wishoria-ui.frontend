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

  return `${base}w_${w},h_${h},c_fill,g_auto,q_auto,f_auto/${rest}`;
}
