"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { listAlerts } from "@/lib/api/endpoints/alerts";
import { queryKeys } from "@/lib/api/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { usePathname } from "next/navigation";

const topbarByPath: Record<string, { title: string; badge?: string }> = {
  "/overview": { title: "Overview" },
  "/alerts": { title: "Alerts" },
  "/investigations": { title: "Investigations" },
  "/model-runs": { title: "Model Runs" },
  "/users": { title: "Users" },
};

export function DashboardFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, appRole, signOut } = useAuth();

  const openAlertsQuery = useQuery({
    queryKey: queryKeys.alerts.list({ status: "open", offset: 0, limit: 1 }),
    queryFn: () => listAlerts({ status: "open", offset: 0, limit: 1 }),
  });
  const highSeverityQuery = useQuery({
    queryKey: queryKeys.alerts.list({ severity: "high", status: "open", offset: 0, limit: 1 }),
    queryFn: () => listAlerts({ severity: "high", status: "open", offset: 0, limit: 1 }),
  });

  const key = Object.keys(topbarByPath).find((candidate) =>
    pathname.startsWith(candidate),
  );
  const topbar = (key && topbarByPath[key]) || { title: "Sentinel" };
  const openQueueCount = openAlertsQuery.data?.total ?? 0;
  const highSeverityCount = highSeverityQuery.data?.total ?? 0;
  const alertBadge = `Open queue: ${openQueueCount}`;

  const showQueueBadge =
    pathname.startsWith("/alerts") || pathname.startsWith("/overview");

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  const roleBadgeStyle =
    appRole === "COMPLIANCE_LEAD"
      ? { background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }
      : { background: "#F3F4F6", color: "#374151", border: "1px solid #D1D5DB" };

  const userActions = (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {/* High severity badge */}
      {highSeverityCount > 0 && (
        <span
          style={{
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600,
            background: "#FDECEC",
            color: "#A32D2D",
            border: "1px solid #F4C7C7",
          }}
        >
          {highSeverityCount} HIGH
        </span>
      )}

      {/* Role badge */}
      {appRole && (
        <span
          style={{
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase" as const,
            ...roleBadgeStyle,
          }}
        >
          {appRole === "COMPLIANCE_LEAD" ? "Compliance Lead" : "Analyst"}
        </span>
      )}

      {/* User email */}
      {user?.email && (
        <span style={{ fontSize: 11, color: "#6B7280", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
          {user.email}
        </span>
      )}

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        style={{
          padding: "4px 10px",
          fontSize: 11,
          fontWeight: 600,
          color: "#374151",
          background: "transparent",
          border: "1px solid #D1D5DB",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        Sign out
      </button>
    </div>
  );

  return (
    <AppShell
      title={topbar.title}
      badge={showQueueBadge ? alertBadge : topbar.badge}
      actions={userActions}
    >
      {children}
    </AppShell>
  );
}
