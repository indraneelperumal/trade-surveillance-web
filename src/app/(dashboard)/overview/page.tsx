"use client";

import { OverviewDashboard } from "@/features/overview/OverviewDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { listAlerts } from "@/lib/api/endpoints/alerts";
import { getOverviewMetrics } from "@/lib/api/endpoints/metrics";
import { listModelRuns } from "@/lib/api/endpoints/modelRuns";
import { listTrades } from "@/lib/api/endpoints/trades";
import { queryKeys } from "@/lib/api/queryKeys";
import { useQuery } from "@tanstack/react-query";

export default function OverviewPage() {
  const { session, isLoading: authLoading } = useAuth();
  // Only fire queries once the auth session is known — prevents 401 on first render.
  const enabled = !authLoading && !!session;

  const metricsQuery = useQuery({
    queryKey: queryKeys.metrics.overview(),
    queryFn: () => getOverviewMetrics(),
    enabled,
  });

  const modelRunsQuery = useQuery({
    queryKey: queryKeys.modelRuns.list({ offset: 0, limit: 5 }),
    queryFn: () => listModelRuns({ offset: 0, limit: 5 }),
    enabled,
  });

  const tradesQuery = useQuery({
    queryKey: queryKeys.trades.list({ offset: 0, limit: 15 }),
    queryFn: () => listTrades({ offset: 0, limit: 15 }),
    enabled,
  });

  const alertsQuery = useQuery({
    queryKey: queryKeys.alerts.list({ offset: 0, limit: 12 }),
    queryFn: () => listAlerts({ offset: 0, limit: 12 }),
    enabled,
  });

  const isPageLoading =
    authLoading ||
    metricsQuery.isPending ||
    modelRunsQuery.isPending ||
    tradesQuery.isPending ||
    alertsQuery.isPending;

  const isError =
    !isPageLoading &&
    metricsQuery.isError &&
    modelRunsQuery.isError &&
    tradesQuery.isError &&
    alertsQuery.isError;

  return (
    <OverviewDashboard
      metrics={metricsQuery.data ?? null}
      modelRuns={modelRunsQuery.data?.items ?? []}
      recentTrades={tradesQuery.data?.items ?? []}
      recentAlerts={alertsQuery.data?.items ?? []}
      isLoading={isPageLoading}
      isError={isError}
    />
  );
}
