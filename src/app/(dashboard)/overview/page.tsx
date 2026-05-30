"use client";

import { OverviewDashboard } from "@/features/overview/OverviewDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/usePermissions";
import { listAlerts } from "@/lib/api/endpoints/alerts";
import { listInvestigations } from "@/lib/api/endpoints/investigations";
import { ApiError } from "@/lib/api/client";
import { getOverviewMetrics } from "@/lib/api/endpoints/metrics";
import { queryKeys } from "@/lib/api/queryKeys";
import type { Alert } from "@/types/domain";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export default function OverviewPage() {
  const { hasAccessToken, isLoading: authLoading, user } = useAuth();
  const { isOfficer, displayName } = useRole();
  const enabled = !authLoading && hasAccessToken;

  const metricsQuery = useQuery({
    queryKey: queryKeys.metrics.overview(),
    queryFn: () => getOverviewMetrics(),
    enabled,
    refetchInterval: 30_000,
  });

  const priorityQuery = useQuery({
    queryKey: queryKeys.alerts.list({
      severity: "high",
      status: "open",
      offset: 0,
      limit: 8,
      view: "overview-priority",
    }),
    queryFn: () =>
      listAlerts({
        severity: "high",
        status: "open",
        offset: 0,
        limit: 8,
        excludeClosed: true,
      }),
    enabled,
    refetchInterval: 30_000,
  });

  const investigationsQuery = useQuery({
    queryKey: queryKeys.investigations.list({ offset: 0, limit: 6, view: "overview" }),
    queryFn: () => listInvestigations({ offset: 0, limit: 6 }),
    enabled,
    refetchInterval: 30_000,
  });

  const alertById = useMemo(() => {
    const map = new Map<string, Alert>();
    for (const a of priorityQuery.data?.items ?? []) {
      map.set(a.id, a);
    }
    const invAlertIds = investigationsQuery.data?.items.map((i) => i.alertId) ?? [];
    for (const id of invAlertIds) {
      if (!map.has(id)) {
        const fromPriority = priorityQuery.data?.items.find((a) => a.id === id);
        if (fromPriority) map.set(id, fromPriority);
      }
    }
    return map;
  }, [priorityQuery.data?.items, investigationsQuery.data?.items]);

  const investigationsNeedSymbols =
    (investigationsQuery.data?.items ?? []).some((i) => !alertById.has(i.alertId));

  const symbolBackfillQuery = useQuery({
    queryKey: queryKeys.alerts.list({ offset: 0, limit: 50, view: "overview-backfill" }),
    queryFn: () => listAlerts({ offset: 0, limit: 50 }),
    enabled: enabled && investigationsNeedSymbols,
  });

  const mergedAlertById = useMemo(() => {
    const map = new Map(alertById);
    for (const a of symbolBackfillQuery.data?.items ?? []) {
      if (!map.has(a.id)) map.set(a.id, a);
    }
    return map;
  }, [alertById, symbolBackfillQuery.data?.items]);

  return (
    <OverviewDashboard
      metrics={metricsQuery.data ?? null}
      priorityAlerts={priorityQuery.data?.items ?? []}
      investigations={investigationsQuery.data?.items ?? []}
      alertById={mergedAlertById}
      isLoading={authLoading || metricsQuery.isPending}
      priorityLoading={priorityQuery.isPending}
      investigationsLoading={investigationsQuery.isPending}
      metricsError={metricsQuery.isError}
      metricsErrorMessage={
        metricsQuery.error instanceof ApiError ? metricsQuery.error.message : undefined
      }
      isOfficer={isOfficer}
      displayName={displayName || user?.email}
    />
  );
}
