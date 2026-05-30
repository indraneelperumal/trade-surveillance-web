import type { ReactNode } from "react";
import type { OverviewMetrics } from "@/lib/api/endpoints/metrics";
import { AnomalyDonut } from "@/features/overview/components/AnomalyDonut";
import { DistributionStrip } from "@/features/overview/components/DistributionStrip";
import { InvestigationsPreview } from "@/features/overview/components/InvestigationsPreview";
import { OverviewHero } from "@/features/overview/components/OverviewHero";
import { PriorityKpiGrid } from "@/features/overview/components/PriorityKpiGrid";
import { PriorityQueuePreview } from "@/features/overview/components/PriorityQueuePreview";
import { TopSymbols } from "@/features/overview/components/TopSymbols";
import { WorkloadPanel } from "@/features/overview/components/WorkloadPanel";
import type { Alert, Investigation } from "@/types/domain";

export type OverviewDashboardProps = {
  metrics: OverviewMetrics | null;
  priorityAlerts?: Alert[];
  investigations?: Investigation[];
  alertById?: Map<string, Alert>;
  isLoading?: boolean;
  priorityLoading?: boolean;
  investigationsLoading?: boolean;
  metricsError?: boolean;
  metricsErrorMessage?: string;
  isOfficer?: boolean;
  displayName?: string;
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
      {children}
    </h2>
  );
}

function OverviewSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-36 rounded-[10px] bg-[var(--color-background-secondary)]" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-[10px] bg-[var(--color-background-secondary)]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-48 rounded-[10px] bg-[var(--color-background-secondary)]" />
        <div className="h-48 rounded-[10px] bg-[var(--color-background-secondary)]" />
      </div>
    </div>
  );
}

export function OverviewDashboard({
  metrics,
  priorityAlerts = [],
  investigations = [],
  alertById = new Map(),
  isLoading = false,
  priorityLoading = false,
  investigationsLoading = false,
  metricsError = false,
  metricsErrorMessage,
  isOfficer = false,
  displayName,
}: OverviewDashboardProps) {
  if (isLoading) {
    return <OverviewSkeleton />;
  }

  if (metricsError) {
    return (
      <div className="app-surface rounded-[10px] border-[#F4C7C7] bg-[#FCEBEB] p-4 text-[12px] text-[#A32D2D]">
        {metricsErrorMessage ?? "Metrics unavailable. Check API connection."}
      </div>
    );
  }

  if (!metrics) return null;

  const escalateCount =
    (metrics.alertsByStatus.escalated ?? 0) + (metrics.alertsByStatus["pending-officer-review"] ?? 0);

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-5">
      <OverviewHero metrics={metrics} isOfficer={isOfficer} displayName={displayName} />

      <section>
        <SectionLabel>Requires attention now</SectionLabel>
        <PriorityKpiGrid
          openHigh={metrics.openHighSeverityCount}
          unassignedHigh={metrics.openUnassignedHigh}
          pendingOfficer={metrics.pendingOfficerReview}
          staleSla={metrics.slaBreachCount}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <PriorityQueuePreview alerts={priorityAlerts} isLoading={priorityLoading} />
        <InvestigationsPreview
          investigations={investigations}
          alertById={alertById}
          isLoading={investigationsLoading}
        />
      </section>

      <section>
        <SectionLabel>Queue health</SectionLabel>
        <DistributionStrip
          alertsByStatus={metrics.alertsByStatus}
          openAlertsBySeverity={metrics.openAlertsBySeverity}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SectionLabel>Anomaly mix</SectionLabel>
          <AnomalyDonut alertsByAnomalyType={metrics.alertsByAnomalyType} />
        </div>
        <div className="lg:col-span-1">
          <SectionLabel>Symbol concentration</SectionLabel>
          <TopSymbols rows={metrics.topSymbolsByAlerts} />
        </div>
        <div className="lg:col-span-1">
          {metrics.alertsPerAssignee.length > 0 ? (
            <>
              <SectionLabel>Analyst capacity</SectionLabel>
              <WorkloadPanel rows={metrics.alertsPerAssignee} />
            </>
          ) : (
            <>
              <SectionLabel>Pipeline snapshot</SectionLabel>
              <div className="app-surface space-y-3 p-4 text-[12px]">
                <div className="flex justify-between border-b border-[var(--color-border-tertiary)] pb-2">
                  <span className="text-[var(--color-text-secondary)]">Total alerts</span>
                  <span className="font-semibold tabular-nums">{metrics.totalAlerts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-[var(--color-border-tertiary)] pb-2">
                  <span className="text-[var(--color-text-secondary)]">Escalated / officer queue</span>
                  <span className="font-semibold tabular-nums">{escalateCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Stale open (&gt;24h)</span>
                  <span className="font-semibold tabular-nums">{metrics.staleOpen24h.toLocaleString()}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
