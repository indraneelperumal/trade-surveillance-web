import { AUTH_COOKIE } from "@/lib/auth/constants";

export const AUTH_SESSION_STORAGE_KEY = "ts_auth_session";
const STORAGE_KEY = AUTH_SESSION_STORAGE_KEY;

export type StoredAuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: { id: string; email: string };
};

export function hasAuthCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${AUTH_COOKIE}=`));
}

function loadFromStorage(): StoredAuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuthSession;
    if (!parsed?.user?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Single session check: cookie (middleware) and localStorage (token + user) must agree.
 * Clears orphaned state when the user wipes one side in devtools.
 */
export function readSession(): StoredAuthSession | null {
  const stored = loadFromStorage();
  const cookie = hasAuthCookie();

  if (!stored && !cookie) return null;

  if (!stored || !cookie) {
    clearSession();
    return null;
  }

  return stored;
}

export function saveSession(session: StoredAuthSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  const maxAge =
    session.expiresAt > 0
      ? Math.max(60, session.expiresAt - Math.floor(Date.now() / 1000))
      : 86400 * 7;
  document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
