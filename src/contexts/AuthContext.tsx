'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import axios from 'axios';
import { getMe, signIn as apiSignIn, signOut as apiSignOut } from '../api/endpoints';
import { setAccessToken, setAuthFailureHandler, refreshAccessToken } from '../api/axios';
import type { SignInRequest, UserProfileDto } from '../types';
import { trackLogin, trackLogout, getOrCreateDeviceId, ingestProfile, setAEPConsent } from '../lib/aep';

interface AuthContextValue {
  user: UserProfileDto | null;
  isLoading: boolean;
  login: (credentials: SignInRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: UserProfileDto) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const bootstrapped = useRef(false);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
  }, []);

  useEffect(() => {
    setAuthFailureHandler(clearAuth);
  }, [clearAuth]);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const bootstrap = async () => {
      try {
        const { accessToken: token } = await refreshAccessToken();
        setAccessToken(token);
        const me = await getMe();
        setUser(me);
      } catch (err) {
        const status = axios.isAxiosError(err) ? err.response?.status : undefined;
        if (status === 401 || status === 403) {
          clearAuth();
        }
      } finally {
        setIsLoading(false);
      }
    };
    void bootstrap();
  }, [clearAuth]);

  const login = useCallback(async (credentials: SignInRequest) => {
    const data = await apiSignIn(credentials);
    setAccessToken(data.jwtToken);
    const me = await getMe();
    setUser(me);
    // Stitch the identity graph: links ECID + device cookie → CRMID + Email.
    // All prior anonymous browsing on this browser becomes attributed to this user.
    const deviceId = getOrCreateDeviceId();
    void trackLogin({ userId: me.id, email: me.email, deviceId });
    // Sync consent state with Alloy on every login
    void setAEPConsent({
      email: me.emailMarketingConsent ? 'y' : 'n',
      ...(me.phoneMarketingConsent !== undefined && { sms: me.phoneMarketingConsent ? 'y' : 'n' }),
    });
    void ingestProfile({
      userId: me.id,
      email: me.email,
      firstName: me.firstName,
      lastName: me.lastName,
      dateOfBirth: me.dateOfBirth,
      emailMarketingConsent: me.emailMarketingConsent,
      phoneNumber: me.phoneNumber,
      phoneMarketingConsent: me.phoneMarketingConsent,
    });
  }, []);

  const logout = useCallback(async () => {
    // Track logout before clearing auth state — we still need user.id and user.email.
    // The event marks all identity namespaces as "loggedOut" in AEP.
    if (user) {
      await trackLogout({ userId: user.id, email: user.email });
    }
    try {
      await apiSignOut();
    } finally {
      clearAuth();
    }
  }, [clearAuth, user]);

  const updateUser = useCallback((updatedUser: UserProfileDto) => {
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
}
