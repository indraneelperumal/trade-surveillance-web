"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { listAlerts } from "@/lib/api/endpoints/alerts";
import { queryKeys } from "@/lib/api/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { usePathname } from "next/navigation";

const topbarByPath: Record<string, { title: string }> = {
  "/queue":          { title: "Work queue" },
  "/cases":          { title: "Case" },
  "/overview":       { title: "Command center" },
  "/team":           { title: "Team" },
  "/alerts":         { title: "Alerts" },
  "/investigations": { title: "Investigations" },
  "/users":          { title: "Users" },
};

export function DashboardFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { hasAccessToken, isLoading: authLoading } = useAuth();
  const highSeverityQuery = useQuery({
    queryKey: queryKeys.alerts.list({ severity: "high", status: "open", offset: 0, limit: 1 }),
    queryFn: () => listAlerts({ severity: "high", status: "open", offset: 0, limit: 1 }),
    enabled: !authLoading && hasAccessToken,
  });

  const key = Object.keys(topbarByPath).find((p) => pathname.startsWith(p));
  const topbar = (key && topbarByPath[key]) || { title: "Agentic Trade Surveillance" };
  const highCount = highSeverityQuery.data?.total ?? 0;

  const actions = (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {highCount > 0 && (
        <span style={{
          padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700,
          background: "var(--sev-high-bg)", color: "var(--sev-high-text)",
          border: "1px solid var(--sev-high-bar)",
        }}>
          {highCount} HIGH
        </span>
      )}
    </div>
  );

  return (
    <AppShell title={topbar.title} actions={actions}>
      {children}
    </AppShell>
  );
}
