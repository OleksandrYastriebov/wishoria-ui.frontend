const DEVICE_COOKIE_NAME = '_wishoria_did';
const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Legacy fallback (IE11, very old mobile browsers)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const row = document.cookie
    .split('; ')
    .find((pair) => pair.startsWith(`${name}=`));
  return row ? decodeURIComponent(row.split('=')[1]) : null;
}

function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === 'undefined') return;
  const isSecure =
    typeof window !== 'undefined' && window.location.protocol === 'https:';
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `max-age=${maxAge}`,
    'path=/',
    'SameSite=Lax',
    ...(isSecure ? ['Secure'] : []),
  ];
  document.cookie = parts.join('; ');
}

export function getOrCreateDeviceId(): string {
  const existing = getCookie(DEVICE_COOKIE_NAME);
  if (existing) return existing;

  const newId = generateUUID();
  setCookie(DEVICE_COOKIE_NAME, newId, DEVICE_COOKIE_MAX_AGE);
  return newId;
}

export function getDeviceId(): string | null {
  return getCookie(DEVICE_COOKIE_NAME);
}
