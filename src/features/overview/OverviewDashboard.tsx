import type { ReactNode } from "react";
import Link from "next/link";
import type { OverviewMetrics } from "@/lib/api/endpoints/metrics";
import { AnomalyDonut } from "@/features/overview/components/AnomalyDonut";
import { DistributionStrip } from "@/features/overview/components/DistributionStrip";
import { TopSymbols } from "@/features/overview/components/TopSymbols";

export type OverviewDashboardProps = {
  metrics: OverviewMetrics | null;
  isLoading?: boolean;
  metricsError?: boolean;
  metricsErrorMessage?: string;
};

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--color-text-tertiary)",
        marginBottom: 12,
      }}
    >
      {children}
    </h2>
  );
}

function ActionCard({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: number;
  href: string;
  accent?: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: "14px 16px",
        borderRadius: 10,
        border: "1px solid var(--color-border-tertiary)",
        background: "var(--color-background-primary)",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 6 }}>{label}</div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: accent ?? "var(--color-text-primary)",
        }}
      >
        {value.toLocaleString()}
      </div>
    </Link>
  );
}

export function OverviewDashboard({
  metrics,
  isLoading = false,
  metricsError = false,
  metricsErrorMessage,
}: OverviewDashboardProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-[var(--color-background-secondary)]" />
          ))}
        </div>
      </div>
    );
  }

  if (metricsError) {
    return (
      <div className="rounded-lg border border-[#F4C7C7] bg-[#FCEBEB] p-4 text-[12px] text-[#A32D2D]">
        {metricsErrorMessage ?? "Metrics unavailable."}
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <section>
        <SectionHeading>Requires action</SectionHeading>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ActionCard
            label="Open high severity"
            value={metrics.openHighSeverityCount}
            href="/queue?view=unassigned"
            accent="var(--sev-high-text)"
          />
          <ActionCard
            label="Unassigned high"
            value={metrics.openUnassignedHigh}
            href="/queue?view=unassigned"
          />
          <ActionCard
            label="Pending officer review"
            value={metrics.pendingOfficerReview}
            href="/queue?view=officer"
          />
          <ActionCard
            label="Stale >24h (SLA)"
            value={metrics.slaBreachCount}
            href="/queue?view=stale"
            accent="var(--sev-med-text)"
          />
        </div>
      </section>

      <section>
        <SectionHeading>Queue health</SectionHeading>
        <DistributionStrip
          alertsByStatus={metrics.alertsByStatus}
          openAlertsBySeverity={metrics.openAlertsBySeverity}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <SectionHeading>Anomaly mix</SectionHeading>
          <AnomalyDonut alertsByAnomalyType={metrics.alertsByAnomalyType} />
        </div>
        <div>
          <SectionHeading>Top symbols by alerts</SectionHeading>
          <TopSymbols rows={metrics.topSymbolsByAlerts} />
        </div>
      </section>

      {metrics.alertsPerAssignee.length > 0 && (
        <section>
          <SectionHeading>Team workload (open cases)</SectionHeading>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[var(--color-border-tertiary)] text-left text-[var(--color-text-tertiary)]">
                <th className="py-2">Analyst</th>
                <th className="py-2">Open cases</th>
              </tr>
            </thead>
            <tbody>
              {metrics.alertsPerAssignee.map((row) => (
                <tr key={row.userId} className="border-b border-[var(--color-border-tertiary)]">
                  <td className="py-2">{row.email}</td>
                  <td className="py-2 font-semibold">{row.openCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
