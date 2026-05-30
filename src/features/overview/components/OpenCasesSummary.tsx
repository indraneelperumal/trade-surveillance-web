import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { OverviewMetrics } from "@/lib/api/endpoints/metrics";

const SEV: { key: string; label: string; color: string }[] = [
  { key: "high", label: "High", color: "var(--sev-high-bar)" },
  { key: "med", label: "Med", color: "var(--sev-med-bar)" },
  { key: "low", label: "Low", color: "var(--sev-low-bar)" },
  { key: "none", label: "None", color: "var(--sev-none-bar)" },
];

type Props = {
  metrics: OverviewMetrics;
};

export function OpenCasesSummary({ metrics }: Props) {
  const entries = SEV.map((s) => ({
    ...s,
    count: metrics.openAlertsBySeverity[s.key] ?? 0,
  })).filter((e) => e.count > 0);
  const openTotal = entries.reduce((n, e) => n + e.count, 0);

  return (
    <Card className="flex h-full flex-col p-4 md:p-5">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
        Open cases by severity
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <span className="text-[36px] font-bold tabular-nums leading-none text-[var(--color-text-primary)]">
          {openTotal.toLocaleString()}
        </span>
        <span className="pb-1 text-[12px] text-[var(--color-text-secondary)]">
          of {metrics.totalAlerts.toLocaleString()} total alerts
        </span>
      </div>

      {openTotal > 0 ? (
        <>
          <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-background-tertiary)]">
            {entries.map((e) => (
              <div
                key={e.key}
                title={`${e.label}: ${e.count}`}
                style={{
                  width: `${(e.count / openTotal) * 100}%`,
                  background: e.color,
                  minWidth: 4,
                }}
              />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SEV.map((s) => {
              const count = metrics.openAlertsBySeverity[s.key] ?? 0;
              return (
                <div
                  key={s.key}
                  className="rounded-md border border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-2.5 py-2"
                >
                  <div className="text-[10px] text-[var(--color-text-tertiary)]">{s.label}</div>
                  <div className="text-[15px] font-bold tabular-nums">{count}</div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p className="mt-3 text-[12px] text-[var(--color-text-secondary)]">No open alerts.</p>
      )}

      <Link
        href="/queue?view=open"
        className="mt-auto pt-4 text-[11px] font-medium text-[var(--color-accent-default)] hover:underline"
      >
        Open work queue →
      </Link>
    </Card>
  );
}
