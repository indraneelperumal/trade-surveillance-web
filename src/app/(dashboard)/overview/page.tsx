"use client";

import { OverviewDashboard } from "@/features/overview/OverviewDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api/client";
import { getOverviewMetrics } from "@/lib/api/endpoints/metrics";
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

  return (
    <OverviewDashboard
      metrics={metricsQuery.data ?? null}
      isLoading={authLoading || metricsQuery.isPending}
      metricsError={metricsQuery.isError}
      metricsErrorMessage={
        metricsQuery.error instanceof ApiError ? metricsQuery.error.message : undefined
      }
    />
  );
}
