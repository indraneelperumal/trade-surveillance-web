"use client";

import { OverviewDashboard } from "@/features/overview/OverviewDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/usePermissions";
import { ApiError } from "@/lib/api/client";
import { getOverviewMetrics } from "@/lib/api/endpoints/metrics";
import { queryKeys } from "@/lib/api/queryKeys";
import { useQuery } from "@tanstack/react-query";

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

  return (
    <OverviewDashboard
      metrics={metricsQuery.data ?? null}
      isLoading={authLoading || metricsQuery.isPending}
      metricsError={metricsQuery.isError}
      metricsErrorMessage={
        metricsQuery.error instanceof ApiError ? metricsQuery.error.message : undefined
      }
      isOfficer={isOfficer}
      displayName={displayName || user?.email}
    />
  );
}
