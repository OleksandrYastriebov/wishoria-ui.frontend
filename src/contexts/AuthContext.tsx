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
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiSignOut();
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

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
