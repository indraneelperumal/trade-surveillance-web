"use client";

import { login as apiLogin, refreshAuth } from "@/lib/api/endpoints/auth";
import { apiFetch, setAuthToken } from "@/lib/api/client";
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
  /** App-level role from the users table (ANALYST | COMPLIANCE_LEAD). */
  appRole: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  appRole: null,
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
  const [appRole, setAppRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppRole = useCallback(async () => {
    try {
      const data = await apiFetch<{ role: string }>("/api/v1/users/me");
      setAppRole(data.role ?? null);
    } catch {
      setAppRole(null);
    }
  }, []);

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
            setAppRole(null);
            setIsLoading(false);
          }
          return;
        }
      }

      if (!cancelled) {
        await fetchAppRole();
        setIsLoading(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [fetchAppRole]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await apiLogin(email, password);
      const session = persistSession(result);
      setUser(session.user);
      await fetchAppRole();
    },
    [fetchAppRole],
  );

  const signOut = useCallback(async () => {
    clearSession();
    setAuthToken(null);
    setUser(null);
    setAppRole(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        appRole,
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
