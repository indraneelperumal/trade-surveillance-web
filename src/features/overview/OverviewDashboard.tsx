import type { OverviewMetrics } from "@/lib/api/endpoints/metrics";
import { AnomalyCompositionChart } from "@/features/overview/components/AnomalyCompositionChart";
import { OpenCasesSummary } from "@/features/overview/components/OpenCasesSummary";
import { OpsMetricTiles } from "@/features/overview/components/OpsMetricTiles";
import { OverviewHero } from "@/features/overview/components/OverviewHero";
import { StatusSeverityCharts } from "@/features/overview/components/StatusSeverityCharts";
import { TopSymbolsChart } from "@/features/overview/components/TopSymbolsChart";
import { WorkloadPanel } from "@/features/overview/components/WorkloadPanel";

export type OverviewDashboardProps = {
  metrics: OverviewMetrics | null;
  isLoading?: boolean;
  metricsError?: boolean;
  metricsErrorMessage?: string;
  isOfficer?: boolean;
  displayName?: string;
};

function OverviewSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-24 rounded-xl bg-[var(--color-background-secondary)]" />
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="h-52 rounded-xl bg-[var(--color-background-secondary)] lg:col-span-2" />
        <div className="h-52 rounded-xl bg-[var(--color-background-secondary)]" />
      </div>
      <div className="h-56 rounded-xl bg-[var(--color-background-secondary)]" />
    </div>
  );
}

function PipelineStats({ metrics }: { metrics: OverviewMetrics }) {
  return (
    <div className="rounded-[10px] border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] p-4">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
        Book totals
      </div>
      <dl className="space-y-2.5 text-[12px]">
        {[
          ["Trades monitored", metrics.totalTrades],
          ["All alerts", metrics.totalAlerts],
          ["Open high severity", metrics.openHighSeverityCount],
          ["Stale open (24h+)", metrics.staleOpen24h],
        ].map(([label, val]) => (
          <div key={String(label)} className="flex items-center justify-between gap-4">
            <dt className="text-[var(--color-text-secondary)]">{label}</dt>
            <dd className="font-semibold tabular-nums">{Number(val).toLocaleString()}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function OverviewDashboard({
  metrics,
  isLoading = false,
  metricsError = false,
  metricsErrorMessage,
  isOfficer = false,
  displayName,
}: OverviewDashboardProps) {
  if (isLoading) return <OverviewSkeleton />;

  if (metricsError) {
    return (
      <div className="rounded-[10px] border border-[#F4C7C7] bg-[#FCEBEB] p-4 text-[12px] text-[#A32D2D]">
        {metricsErrorMessage ?? "Metrics unavailable. Check API connection."}
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <OverviewHero metrics={metrics} isOfficer={isOfficer} displayName={displayName} />

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OpenCasesSummary metrics={metrics} />
        </div>
        <OpsMetricTiles
          unassignedHigh={metrics.openUnassignedHigh}
          pendingOfficer={metrics.pendingOfficerReview}
          staleSla={metrics.slaBreachCount}
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <TopSymbolsChart rows={metrics.topSymbolsByAlerts} totalAlerts={metrics.totalAlerts} />
        <AnomalyCompositionChart alertsByAnomalyType={metrics.alertsByAnomalyType} />
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <StatusSeverityCharts
            alertsByStatus={metrics.alertsByStatus}
            openAlertsBySeverity={metrics.openAlertsBySeverity}
          />
        </div>
        <div className="flex flex-col gap-3">
          {metrics.alertsPerAssignee.length > 0 ? (
            <WorkloadPanel rows={metrics.alertsPerAssignee} />
          ) : (
            <PipelineStats metrics={metrics} />
          )}
        </div>
      </div>
    </div>
  );
}
