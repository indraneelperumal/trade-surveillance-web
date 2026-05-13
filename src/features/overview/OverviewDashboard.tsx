import type { OverviewMetrics } from "@/lib/api/endpoints/metrics";
import { AnomalyDonut } from "@/features/overview/components/AnomalyDonut";
import { DistributionStrip } from "@/features/overview/components/DistributionStrip";
import { ModelHealthCard } from "@/features/overview/components/ModelHealthCard";
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
  isLoading?: boolean;
  isError?: boolean;
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
      textTransform: "uppercase", color: "var(--color-text-tertiary)",
      marginBottom: 12,
    }}>
      {children}
    </h2>
  );
}

export function OverviewDashboard({
  metrics,
  modelRuns,
  recentTrades,
  recentAlerts,
  isLoading = false,
  isError = false,
}: OverviewDashboardProps) {
  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="animate-pulse">
        <div style={{ height: 88, borderRadius: 10, background: "var(--color-background-secondary)" }} />
        <div style={{ height: 200, borderRadius: 10, background: "var(--color-background-secondary)" }} />
        <div style={{ height: 120, borderRadius: 10, background: "var(--color-background-secondary)" }} />
        <div style={{ height: 160, borderRadius: 10, background: "var(--color-background-secondary)" }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{
        borderRadius: 10, border: "1px solid #F4C7C7",
        background: "#FCEBEB", padding: "12px 16px",
        fontSize: 12, color: "#A32D2D",
      }}>
        Overview data unavailable. Check backend connection.
      </div>
    );
  }

  const latestRun = modelRuns[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── KPI strip ─────────────────────────────────────────────────────── */}
      <section>
        <OverviewKpiStrip metrics={metrics} />
      </section>

      {/* ── Detection pipeline ────────────────────────────────────────────── */}
      <section>
        <SectionHeading>Detection pipeline</SectionHeading>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 16,
        }}
          className="lg:!grid-cols-[3fr_2fr]"
        >
          {metrics ? (
            <AnomalyDonut alertsByAnomalyType={metrics.alertsByAnomalyType} />
          ) : (
            <div style={{ height: 200, borderRadius: 10, background: "var(--color-background-secondary)" }} />
          )}
          <ModelHealthCard run={latestRun} />
        </div>
      </section>

      {/* ── Queue health ──────────────────────────────────────────────────── */}
      {metrics && (
        <section>
          <SectionHeading>Queue health</SectionHeading>
          <DistributionStrip
            alertsByStatus={metrics.alertsByStatus}
            openAlertsBySeverity={metrics.openAlertsBySeverity}
          />
        </section>
      )}

      {/* ── Activity ──────────────────────────────────────────────────────── */}
      <section>
        <SectionHeading>Activity</SectionHeading>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 16,
          marginBottom: 16,
        }}
          className="lg:!grid-cols-[3fr_2fr]"
        >
          <RecentAlerts alerts={recentAlerts} />
          {metrics && <TopSymbols rows={metrics.topSymbolsByAlerts} />}
        </div>
        <RecentTrades trades={recentTrades} />
      </section>

    </div>
  );
}
