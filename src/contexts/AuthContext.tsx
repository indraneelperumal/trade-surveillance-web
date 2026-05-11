"use client";

import { setAuthToken } from "@/lib/api/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  /** App-level role from the users table (ANALYST | COMPLIANCE_LEAD). */
  appRole: string | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  appRole: null,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [appRole, setAppRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Lazily initialised — only ever created in the browser, never during SSR.
  const supabaseRef = useRef<SupabaseClient | null>(null);

  function getSupabase(): SupabaseClient | null {
    if (typeof window === "undefined") return null;
    if (!supabaseRef.current) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) return null;
      // Dynamic import to avoid bundling on the server.
      const { createBrowserClient } = require("@supabase/ssr") as typeof import("@supabase/ssr");
      supabaseRef.current = createBrowserClient(url, key);
    }
    return supabaseRef.current;
  }

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setAuthToken(s?.access_token ?? null);
      if (s) void fetchAppRole(s.access_token, s.user.email ?? "");
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setAuthToken(s?.access_token ?? null);
      if (s) {
        void fetchAppRole(s.access_token, s.user.email ?? "");
      } else {
        setAppRole(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAppRole(token: string | undefined, _email: string | undefined) {
    if (!token) return;
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
      // Use /me to avoid paginated user list — resilient regardless of roster size.
      const res = await fetch(`${apiBase}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { role: string };
      if (data.role) setAppRole(data.role);
    } catch {
      // Non-fatal — role stays null, UI falls back to least-privilege display.
    }
  }

  async function signOut() {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    setAuthToken(null);
    setSession(null);
    setUser(null);
    setAppRole(null);
  }

  return (
    <AuthContext.Provider value={{ session, user, appRole, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
