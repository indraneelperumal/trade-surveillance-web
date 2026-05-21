"use client";

import { OverviewDashboard } from "@/features/overview/OverviewDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api/client";
import { listAlerts } from "@/lib/api/endpoints/alerts";
import { getOverviewMetrics } from "@/lib/api/endpoints/metrics";
import { listTrades } from "@/lib/api/endpoints/trades";
import { queryKeys } from "@/lib/api/queryKeys";
import { useQuery } from "@tanstack/react-query";

export default function OverviewPage() {
  const { hasAccessToken, isLoading: authLoading } = useAuth();
  const enabled = !authLoading && hasAccessToken;

  const metricsQuery = useQuery({
    queryKey: queryKeys.metrics.overview(),
    queryFn: () => getOverviewMetrics(),
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
    tradesQuery.isPending ||
    alertsQuery.isPending;

  return (
    <OverviewDashboard
      metrics={metricsQuery.data ?? null}
      recentTrades={tradesQuery.data?.items ?? []}
      recentAlerts={alertsQuery.data?.items ?? []}
      isLoading={isPageLoading}
      metricsError={metricsQuery.isError}
      metricsErrorMessage={
        metricsQuery.error instanceof ApiError ? metricsQuery.error.message : undefined
      }
      tradesError={tradesQuery.isError}
      alertsError={alertsQuery.isError}
    />
  );
}
