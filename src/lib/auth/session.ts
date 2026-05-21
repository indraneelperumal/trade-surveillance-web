import { AUTH_COOKIE } from "@/lib/auth/constants";

const STORAGE_KEY = "ts_auth_session";

export type StoredAuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: { id: string; email: string };
};

export function loadSession(): StoredAuthSession | null {
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

export function saveSession(session: StoredAuthSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  const maxAge = session.expiresAt > 0 ? Math.max(60, session.expiresAt - Math.floor(Date.now() / 1000)) : 86400 * 7;
  document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function hasAuthCookie(): boolean {
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${AUTH_COOKIE}=`));
}
