"use client";

import { login as apiLogin, refreshAuth } from "@/lib/api/endpoints/auth";
import { setAuthToken } from "@/lib/api/client";
import {
  clearSession,
  loadSession,
  saveSession,
  type StoredAuthSession,
} from "@/lib/auth/session";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type AuthUser = {
  id: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

function persistSession(payload: {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}): StoredAuthSession {
  const session: StoredAuthSession = {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    expiresAt:
      payload.expiresIn > 0
        ? Math.floor(Date.now() / 1000) + payload.expiresIn
        : 0,
    user: payload.user,
  };
  saveSession(session);
  setAuthToken(payload.accessToken || null);
  return session;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const stored = loadSession();
      if (!stored) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      setUser(stored.user);
      setAuthToken(stored.accessToken || null);

      const now = Math.floor(Date.now() / 1000);
      const needsRefresh =
        stored.refreshToken &&
        stored.expiresAt > 0 &&
        stored.expiresAt - now < 120;

      if (needsRefresh) {
        try {
          const refreshed = await refreshAuth(stored.refreshToken);
          const next = persistSession(refreshed);
          if (!cancelled) setUser(next.user);
        } catch {
          clearSession();
          if (!cancelled) {
            setUser(null);
            setAuthToken(null);
            setIsLoading(false);
          }
          return;
        }
      }

      if (!cancelled) setIsLoading(false);
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    const session = persistSession(result);
    setUser(session.user);
  }, []);

  const signOut = useCallback(async () => {
    clearSession();
    setAuthToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
