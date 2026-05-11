"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { listAlerts } from "@/lib/api/endpoints/alerts";
import { queryKeys } from "@/lib/api/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { usePathname } from "next/navigation";

const topbarByPath: Record<string, { title: string }> = {
  "/overview":       { title: "Overview" },
  "/alerts":         { title: "Alerts" },
  "/investigations": { title: "Investigations" },
  "/model-runs":     { title: "Model Runs" },
  "/users":          { title: "Users" },
};

export function DashboardFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { appRole } = useAuth();

  const highSeverityQuery = useQuery({
    queryKey: queryKeys.alerts.list({ severity: "high", status: "open", offset: 0, limit: 1 }),
    queryFn: () => listAlerts({ severity: "high", status: "open", offset: 0, limit: 1 }),
  });

  const key = Object.keys(topbarByPath).find((p) => pathname.startsWith(p));
  const topbar = (key && topbarByPath[key]) || { title: "Sentinel" };
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
      {appRole && (
        <span style={{
          padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700,
          letterSpacing: "0.06em", textTransform: "uppercase" as const,
          background: appRole === "COMPLIANCE_LEAD" ? "var(--status-open-bg)" : "var(--color-background-secondary)",
          color: appRole === "COMPLIANCE_LEAD" ? "var(--status-open-text)" : "var(--color-text-secondary)",
          border: "1px solid var(--color-border-secondary)",
        }}>
          {appRole === "COMPLIANCE_LEAD" ? "Compliance Lead" : "Analyst"}
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
