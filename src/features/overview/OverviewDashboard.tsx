import type { OverviewMetrics } from "@/lib/api/endpoints/metrics";
import { DistributionStrip } from "@/features/overview/components/DistributionStrip";
import { ModelRunPanel } from "@/features/overview/components/ModelRunPanel";
import { OverviewKpiStrip } from "@/features/overview/components/OverviewKpiStrip";
import { RecentAlerts } from "@/features/overview/components/RecentAlerts";
import { RecentTrades } from "@/features/overview/components/RecentTrades";
import { TopSymbols } from "@/features/overview/components/TopSymbols";
import type { Alert, ModelRun, Trade } from "@/types/domain";

export type OverviewDashboardProps = {
  metrics: OverviewMetrics | null;
  modelRuns: ModelRun[];
  recentTrades: Trade[];
  recentAlerts: Alert[];
};

export function OverviewDashboard({
  metrics,
  modelRuns,
  recentTrades,
  recentAlerts,
}: OverviewDashboardProps) {
  const empty =
    !metrics && modelRuns.length === 0 && recentTrades.length === 0 && recentAlerts.length === 0;

  if (empty) {
    return (
      <div className="rounded-[10px] border border-[#F4C7C7] bg-[#FCEBEB] px-4 py-3 text-[12px] text-[#A32D2D]">
        Backend unavailable. Overview data cannot be loaded right now.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-3 text-[13px] font-semibold text-[var(--color-text-primary)]">
          Operations health
        </h2>
        <OverviewKpiStrip metrics={metrics} />
      </section>

      {metrics ? (
        <section>
          <h2 className="mb-3 text-[13px] font-semibold text-[var(--color-text-primary)]">
            Risk and detection
          </h2>
          <DistributionStrip
            alertsByStatus={metrics.alertsByStatus}
            alertsBySeverity={metrics.alertsBySeverity}
            alertsByAnomalyType={metrics.alertsByAnomalyType}
            openAlertsBySeverity={metrics.openAlertsBySeverity}
          />
          <div className="mt-4 max-w-md">
            <TopSymbols rows={metrics.topSymbolsByAlerts} />
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 text-[13px] font-semibold text-[var(--color-text-primary)]">
          Activity and model
        </h2>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <RecentAlerts alerts={recentAlerts} />
          <RecentTrades trades={recentTrades} />
        </div>
        <div className="mt-4 max-w-3xl">
          <ModelRunPanel runs={modelRuns} />
        </div>
      </section>
    </div>
  );
}
