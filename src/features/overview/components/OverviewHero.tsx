import Link from "next/link";
import { ArrowRight, FileSearch, ListOrdered } from "lucide-react";
import type { OverviewMetrics } from "@/lib/api/endpoints/metrics";

type Props = {
  metrics: OverviewMetrics;
  isOfficer: boolean;
  displayName?: string;
};

function openCaseCount(metrics: OverviewMetrics) {
  const s = metrics.alertsByStatus;
  return (
    (s.open ?? 0) +
    (s["in-progress"] ?? 0) +
    (s["pending-officer-review"] ?? 0) +
    (s.escalated ?? 0)
  );
}

export function OverviewHero({ metrics, isOfficer, displayName }: Props) {
  const open = openCaseCount(metrics);
  const greeting = displayName ? displayName.split("@")[0] : isOfficer ? "Officer" : "Analyst";

  return (
    <div className="app-surface flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
          Command center
        </p>
        <h1 className="mt-1 text-[22px] font-bold tracking-tight text-[var(--color-text-primary)]">
          {isOfficer ? "Compliance overview" : "Morning briefing"}
          {greeting ? `, ${greeting}` : ""}
        </h1>
        <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          {isOfficer
            ? "Officer queue, SLA risk, and team workload at a glance before sign-off."
            : "Start with high-severity and unassigned cases, then review AI investigations."}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[var(--color-text-secondary)]">
          <span>
            <strong className="font-semibold text-[var(--color-text-primary)]">{open.toLocaleString()}</strong>{" "}
            open cases
          </span>
          <span>
            <strong className="font-semibold text-[var(--sev-high-text)]">
              {metrics.openHighSeverityCount.toLocaleString()}
            </strong>{" "}
            high severity
          </span>
          <span>
            <strong className="font-semibold text-[var(--color-text-primary)]">
              {metrics.totalTrades.toLocaleString()}
            </strong>{" "}
            trades monitored
          </span>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Link
          href="/queue?view=open"
          className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border-secondary)] bg-[var(--color-background-secondary)] px-3 py-2 text-[12px] font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-background-tertiary)]"
        >
          <ListOrdered size={14} />
          Work queue
          <ArrowRight size={12} className="opacity-60" />
        </Link>
        <Link
          href="/investigations"
          className="inline-flex items-center gap-2 rounded-md bg-[var(--color-accent-default)] px-3 py-2 text-[12px] font-medium text-white transition hover:opacity-90"
        >
          <FileSearch size={14} />
          Investigations
          <ArrowRight size={12} className="opacity-80" />
        </Link>
      </div>
    </div>
  );
}
