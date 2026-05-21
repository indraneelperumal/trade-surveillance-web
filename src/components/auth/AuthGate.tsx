"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

/**
 * Client guard for dashboard routes. Middleware only sees the ts_auth cookie;
 * this redirects when React session state is missing (e.g. localStorage cleared).
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, syncSession } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    syncSession();
  }, [syncSession, pathname]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      const redirectTo = pathname.startsWith("/") ? pathname : "/overview";
      router.replace(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div style={{ padding: 24, fontSize: 13, color: "var(--color-text-tertiary)" }}>
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
