import type { IdentityMap, IdentityMapEntry } from './types';

export const IDENTITY_NAMESPACES = {
  ECID: 'ECID',
  EMAIL: 'Email',
  CRMID: 'WISHORIA_CRMID',
  DEVICE: 'WISHORIA_DEVICE',
} as const;

function makeEntry(
  id: string,
  primary: boolean,
  authenticatedState: IdentityMapEntry['authenticatedState']
): IdentityMapEntry[] {
  return [{ id, primary, authenticatedState }];
}

export function buildAnonymousIdentityMap(deviceId: string): IdentityMap {
  return {
    [IDENTITY_NAMESPACES.DEVICE]: makeEntry(deviceId, false, 'ambiguous'),
  };
}

export function buildAuthenticatedIdentityMap(
  userId: string | number,
  email: string,
  deviceId: string
): IdentityMap {
  return {
    [IDENTITY_NAMESPACES.CRMID]: makeEntry(String(userId), true, 'authenticated'),
    [IDENTITY_NAMESPACES.EMAIL]: makeEntry(email, false, 'authenticated'),
    [IDENTITY_NAMESPACES.DEVICE]: makeEntry(deviceId, false, 'authenticated'),
  };
}

export function buildLoggedOutIdentityMap(
  userId: string | number,
  email: string,
  deviceId: string
): IdentityMap {
  return {
    [IDENTITY_NAMESPACES.CRMID]: makeEntry(String(userId), true, 'loggedOut'),
    [IDENTITY_NAMESPACES.EMAIL]: makeEntry(email, false, 'loggedOut'),
    [IDENTITY_NAMESPACES.DEVICE]: makeEntry(deviceId, false, 'loggedOut'),
  };
}
