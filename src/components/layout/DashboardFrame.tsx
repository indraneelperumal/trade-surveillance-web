"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { listAlerts } from "@/lib/api/endpoints/alerts";
import { queryKeys } from "@/lib/api/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { ReactNode } from "react";
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
  const openAlertsQuery = useQuery({
    queryKey: queryKeys.alerts.list({ status: "open", offset: 0, limit: 1 }),
    queryFn: () => listAlerts({ status: "open", offset: 0, limit: 1 }),
  });
  const highSeverityQuery = useQuery({
    queryKey: queryKeys.alerts.list({ severity: "high", offset: 0, limit: 1 }),
    queryFn: () => listAlerts({ severity: "high", offset: 0, limit: 1 }),
  });
  const key = Object.keys(topbarByPath).find((candidate) =>
    pathname.startsWith(candidate),
  );
  const topbar = (key && topbarByPath[key]) || { title: "Sentinel" };
  const openQueueCount = openAlertsQuery.data?.total ?? 0;
  const highSeverityCount = highSeverityQuery.data?.total ?? 0;
  const alertBadge = `Open queue: ${openQueueCount}`;
  const actionLabel =
    pathname.startsWith("/alerts") || pathname.startsWith("/investigations")
      ? `New Investigation (${highSeverityCount} high)`
      : "New Investigation";

  return (
    <AppShell
      title={topbar.title}
      badge={pathname.startsWith("/alerts") ? alertBadge : topbar.badge}
      actions={
        <Button variant="primary" type="button">
          {actionLabel}
        </Button>
      }
    >
      {children}
    </AppShell>
  );
}
