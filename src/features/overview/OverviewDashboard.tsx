import type { ReactNode } from "react";
import type { OverviewMetrics } from "@/lib/api/endpoints/metrics";
import { AnomalyDonut } from "@/features/overview/components/AnomalyDonut";
import { DistributionStrip } from "@/features/overview/components/DistributionStrip";
import { OverviewKpiStrip } from "@/features/overview/components/OverviewKpiStrip";
import { RecentAlerts } from "@/features/overview/components/RecentAlerts";
import { RecentTrades } from "@/features/overview/components/RecentTrades";
import { TopSymbols } from "@/features/overview/components/TopSymbols";
import type { Alert, Trade } from "@/types/domain";

export type OverviewDashboardProps = {
  metrics: OverviewMetrics | null;
  recentTrades: Trade[];
  recentAlerts: Alert[];
  isLoading?: boolean;
  metricsError?: boolean;
  tradesError?: boolean;
  alertsError?: boolean;
};

function SectionHeading({ children }: { children: ReactNode }) {
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

function InlineError({ message }: { message: string }) {
  return (
    <div style={{
      borderRadius: 10, border: "1px solid #F4C7C7",
      background: "#FCEBEB", padding: "10px 14px",
      fontSize: 12, color: "#A32D2D",
    }}>
      {message}
    </div>
  );
}

export function OverviewDashboard({
  metrics,
  recentTrades,
  recentAlerts,
  isLoading = false,
  metricsError = false,
  tradesError = false,
  alertsError = false,
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <section>
        {metricsError ? (
          <InlineError message="Metrics unavailable. Check API auth and NEXT_PUBLIC_API_BASE_URL." />
        ) : (
          <OverviewKpiStrip metrics={metrics} />
        )}
      </section>

      <section>
        <SectionHeading>Alerts by anomaly type</SectionHeading>
        {metricsError ? (
          <InlineError message="Chart data unavailable." />
        ) : metrics ? (
          <AnomalyDonut alertsByAnomalyType={metrics.alertsByAnomalyType} />
        ) : (
          <div style={{ height: 200, borderRadius: 10, background: "var(--color-background-secondary)" }} />
        )}
      </section>

      {metrics && !metricsError && (
        <section>
          <SectionHeading>Queue health</SectionHeading>
          <DistributionStrip
            alertsByStatus={metrics.alertsByStatus}
            openAlertsBySeverity={metrics.openAlertsBySeverity}
          />
        </section>
      )}

      <section>
        <SectionHeading>Activity</SectionHeading>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr] mb-4">
          {alertsError ? (
            <InlineError message="Recent alerts unavailable." />
          ) : (
            <RecentAlerts alerts={recentAlerts} />
          )}
          {metrics && !metricsError ? (
            <TopSymbols rows={metrics.topSymbolsByAlerts} />
          ) : null}
        </div>
        {tradesError ? (
          <InlineError message="Recent trades unavailable." />
        ) : (
          <RecentTrades trades={recentTrades} />
        )}
      </section>

    </div>
  );
}
