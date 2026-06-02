"use client";

import { login as apiLogin, refreshAuth } from "@/lib/api/endpoints/auth";
import { getAuthSession, type AuthUser } from "@/lib/api/endpoints/session";
import { setAuthToken } from "@/lib/api/client";
import { defaultRouteForRole } from "@/lib/domain/labels";
import {
  AUTH_SESSION_STORAGE_KEY,
  clearSession,
  readSession,
  saveSession,
  type StoredAuthSession,
} from "@/lib/auth/session";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type { AuthUser };

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasAccessToken: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<string>;
  signOut: () => void;
  syncSession: () => boolean;
  defaultRoute: string;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  hasAccessToken: false,
  isLoading: true,
  signIn: async () => "/queue",
  signOut: () => {},
  syncSession: () => false,
  defaultRoute: "/queue",
});

function applyStoredSession(stored: StoredAuthSession) {
  setAuthToken(stored.accessToken || null);
  return stored.user as AuthUser;
}

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
  const [hasAccessToken, setHasAccessToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const updateAccessTokenFlag = useCallback((token: string | null) => {
    setHasAccessToken(Boolean(token?.trim()));
  }, []);

  const syncSession = useCallback((): boolean => {
    const stored = readSession();
    if (!stored) {
      setAuthToken(null);
      setUser(null);
      updateAccessTokenFlag(null);
      return false;
    }
    const token = stored.accessToken || null;
    setAuthToken(token);
    setUser(stored.user as AuthUser);
    updateAccessTokenFlag(token);
    return true;
  }, [updateAccessTokenFlag]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const stored = readSession();
      if (!stored) {
        if (!cancelled) {
          setAuthToken(null);
          setUser(null);
          updateAccessTokenFlag(null);
          setIsLoading(false);
        }
        return;
      }

      setUser(stored.user as AuthUser);
      const token = stored.accessToken || null;
      setAuthToken(token);
      updateAccessTokenFlag(token);
      // Unblock UI immediately — validate/refresh in background (Render cold start can take 30–60s).
      if (!cancelled) setIsLoading(false);

      const now = Math.floor(Date.now() / 1000);
      const needsRefresh =
        stored.refreshToken &&
        stored.expiresAt > 0 &&
        stored.expiresAt - now < 120;

      if (needsRefresh) {
        try {
          const refreshed = await refreshAuth(stored.refreshToken);
          const next = persistSession(refreshed);
          if (!cancelled) {
            setUser(next.user as AuthUser);
            updateAccessTokenFlag(next.accessToken);
          }
        } catch {
          clearSession();
          if (!cancelled) {
            setAuthToken(null);
            setUser(null);
            updateAccessTokenFlag(null);
          }
          return;
        }
      }

      if (token) {
        try {
          const session = await getAuthSession();
          if (!cancelled) setUser(session.user);
        } catch {
          // keep stored user if session endpoint fails (e.g. API waking up)
        }
      }
    }

    void bootstrap();

    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== AUTH_SESSION_STORAGE_KEY) return;
      syncSession();
    };
    const onFocus = () => syncSession();

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, [syncSession, updateAccessTokenFlag]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await apiLogin(email, password);
      const session = persistSession(result);
      setUser(session.user as AuthUser);
      updateAccessTokenFlag(session.accessToken);
      return defaultRouteForRole(session.user.role ?? "ANALYST");
    },
    [updateAccessTokenFlag],
  );

  const signOut = useCallback(() => {
    clearSession();
    setAuthToken(null);
    setUser(null);
    updateAccessTokenFlag(null);
    window.location.href = "/login";
  }, [updateAccessTokenFlag]);

  const defaultRoute = defaultRouteForRole(user?.role ?? "ANALYST");

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        hasAccessToken,
        isLoading,
        signIn,
        signOut,
        syncSession,
        defaultRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
