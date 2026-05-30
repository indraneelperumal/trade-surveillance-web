import Link from "next/link";
import { AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
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

function insightCopy(metrics: OverviewMetrics, isOfficer: boolean) {
  if (metrics.slaBreachCount > 0) {
    return {
      title: "SLA attention required",
      body: `${metrics.slaBreachCount} open case${metrics.slaBreachCount === 1 ? "" : "s"} have exceeded the 24-hour review window. Prioritise stale items before new intake.`,
      href: "/queue?view=stale",
      cta: "Review stale queue",
    };
  }
  if (metrics.openUnassignedHigh > 0) {
    return {
      title: "Unassigned high-severity cases",
      body: `${metrics.openUnassignedHigh} high-severity alert${metrics.openUnassignedHigh === 1 ? "" : "s"} still lack an owner. Assign or take cases to keep the queue moving.`,
      href: "/queue?view=unassigned",
      cta: "Open unassigned queue",
    };
  }
  if (isOfficer && metrics.pendingOfficerReview > 0) {
    return {
      title: "Officer sign-off pending",
      body: `${metrics.pendingOfficerReview} case${metrics.pendingOfficerReview === 1 ? "" : "s"} await compliance review. Clear the officer queue to close the loop on AI-assisted investigations.`,
      href: "/queue?view=officer",
      cta: "Officer queue",
    };
  }
  const open = openCaseCount(metrics);
  return {
    title: "Surveillance posture stable",
    body: `${open} open case${open === 1 ? "" : "s"} across the book with ${metrics.openHighSeverityCount} high severity. Use the queue for case work — this page tracks volume and concentration only.`,
    href: "/queue?view=open",
    cta: "Go to work queue",
  };
}

export function OverviewHero({ metrics, isOfficer, displayName }: Props) {
  const insight = insightCopy(metrics, isOfficer);
  const name = displayName?.split("@")[0];

  return (
    <div className="overview-insight-banner relative overflow-hidden rounded-xl border px-5 py-4 md:px-6 md:py-5">
      <div className="relative z-[1] flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-3">
          <div className="overview-insight-banner__icon mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            {metrics.slaBreachCount > 0 || metrics.openUnassignedHigh > 0 ? (
              <AlertTriangle size={18} strokeWidth={2} />
            ) : (
              <Sparkles size={18} strokeWidth={2} />
            )}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
              {isOfficer ? "Compliance briefing" : "Operations insight"}
              {name ? ` · ${name}` : ""}
            </p>
            <h2 className="mt-1 text-[16px] font-bold tracking-tight text-[var(--color-text-primary)] md:text-[17px]">
              {insight.title}
            </h2>
            <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-[var(--color-text-secondary)] md:text-[13px]">
              {insight.body}
            </p>
          </div>
        </div>
        <Link
          href={insight.href}
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-md bg-[var(--color-accent-default)] px-3 py-2 text-[11px] font-semibold text-white transition hover:opacity-90"
        >
          {insight.cta}
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
