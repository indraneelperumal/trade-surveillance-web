import { Badge } from "@/components/ui/Badge";
import {
  severityLabel,
  severityVariant,
  statusLabel,
  statusVariant,
} from "@/features/alerts/adapters/alertView";
import {
  confidenceLabel,
  verdictBadgeClass,
  verdictLabel,
} from "@/features/investigations/adapters/investigationView";
import type { InvestigationListItem } from "@/features/investigations/hooks/useInvestigationListContext";
import { anomalyLabel } from "@/lib/domain/labels";
import { caseDetailHref } from "@/lib/navigation/caseReturn";
import { formatDateTime, formatRelativeDate } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const SEVERITY_STRIPE: Record<string, string> = {
  "severity-high": "var(--sev-high-bar)",
  "severity-med": "var(--sev-med-bar)",
  "severity-low": "var(--sev-low-bar)",
  "severity-none": "var(--sev-none-bar)",
};

function TradeContextLine({ item }: { item: InvestigationListItem }) {
  const { trade, alert } = item;
  if (!trade) {
    return (
      <p className="text-[11px] text-[var(--color-text-tertiary)]">
        {alert?.traderId ? (
          <>
            Trader <span className="mono">{alert.traderId}</span>
          </>
        ) : (
          "Trade details loading or unavailable"
        )}
      </p>
    );
  }

  const sidePriceVol = `${trade.side} · $${trade.price.toFixed(2)} · ${trade.volume.toLocaleString()} sh`;
  const trader = trade.traderId ?? alert?.traderId;
  const time = formatDateTime(trade.tradedAt);

  return (
    <p className="text-[11px] text-[var(--color-text-secondary)]">
      <span className="font-medium text-[var(--color-text-primary)]">{sidePriceVol}</span>
      {trader ? (
        <>
          {" · "}
          Trader <span className="mono">{trader}</span>
        </>
      ) : null}
      {" · "}
      <span className="mono">{time}</span>
      {trade.offHours || trade.otc ? (
        <span className="ml-2 inline-flex gap-1">
          {trade.offHours ? (
            <span className="rounded-[3px] border border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
              Off-hrs
            </span>
          ) : null}
          {trade.otc ? (
            <span className="rounded-[3px] border border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
              OTC
            </span>
          ) : null}
        </span>
      ) : null}
    </p>
  );
}

export function InvestigationQueueRow({ item }: { item: InvestigationListItem }) {
  const { investigation, alert } = item;
  const symbol = alert?.symbol ?? "—";
  const severity = alert?.severity ?? "none";
  const sevVariant = severityVariant(severity);
  const stripe = SEVERITY_STRIPE[sevVariant] ?? SEVERITY_STRIPE["severity-none"];

  return (
    <Link
      href={caseDetailHref(investigation.alertId, "investigations")}
      className="group flex gap-0 border-b border-[var(--color-border-tertiary)] hover:bg-[var(--color-background-secondary)]"
    >
      <div className="w-1 shrink-0 self-stretch" style={{ background: stripe }} aria-hidden />

      <div className="flex min-w-0 flex-1 items-start justify-between gap-4 px-4 py-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-bold tracking-tight text-[var(--color-text-primary)]">
              {symbol}
            </span>
            {alert?.anomalyType ? (
              <span className="rounded-[4px] border border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-2 py-0.5 text-[11px] font-medium capitalize text-[var(--color-text-secondary)]">
                {anomalyLabel(alert.anomalyType)}
              </span>
            ) : null}
            {alert ? (
              <>
                <Badge variant={sevVariant}>{severityLabel(severity)}</Badge>
                <Badge variant={statusVariant(alert.status)}>{statusLabel(alert.status)}</Badge>
              </>
            ) : null}
            <span className={verdictBadgeClass(investigation.verdict)}>
              {verdictLabel(investigation.verdict)}
            </span>
            {confidenceLabel(investigation.confidence) ? (
              <span className="text-[10px] font-medium text-[var(--color-text-tertiary)]">
                {confidenceLabel(investigation.confidence)}
              </span>
            ) : null}
          </div>

          <TradeContextLine item={item} />

          {(investigation.ruleViolated || typeof alert?.anomalyScore === "number") && (
            <p className="text-[11px] text-[var(--color-text-tertiary)]">
              {investigation.ruleViolated ? (
                <span>
                  Rule: <span className="text-[var(--color-text-secondary)]">{investigation.ruleViolated}</span>
                </span>
              ) : null}
              {investigation.ruleViolated && typeof alert?.anomalyScore === "number" ? " · " : null}
              {typeof alert?.anomalyScore === "number" ? (
                <span>
                  ML score{" "}
                  <span className="mono font-medium text-[var(--color-text-secondary)]">
                    {alert.anomalyScore.toFixed(3)}
                  </span>
                </span>
              ) : null}
            </p>
          )}

          {investigation.summary ? (
            <p className="line-clamp-2 text-[12px] leading-5 text-[var(--color-text-secondary)]">
              {investigation.summary}
            </p>
          ) : null}

          <p className="text-[10px] text-[var(--color-text-tertiary)]">
            Case {investigation.alertId.slice(0, 8)}…
            {alert?.assignee ? ` · Assigned ${alert.assignee}` : " · Unassigned"}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2 pt-0.5">
          <span className="whitespace-nowrap text-[11px] text-[var(--color-text-secondary)]">
            {formatRelativeDate(investigation.updatedAt)}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-accent-default)] opacity-0 transition-opacity group-hover:opacity-100">
            Open case
            <ArrowUpRight size={12} strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function InvestigationQueueSkeletonRow() {
  return (
    <div className="flex gap-0 border-b border-[var(--color-border-tertiary)] px-4 py-3">
      <div className="mr-3 w-1 shrink-0 self-stretch animate-pulse rounded bg-[var(--color-background-secondary)]" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex gap-2">
          <div className="h-5 w-14 animate-pulse rounded bg-[var(--color-background-secondary)]" />
          <div className="h-5 w-24 animate-pulse rounded bg-[var(--color-background-secondary)]" />
          <div className="h-5 w-16 animate-pulse rounded bg-[var(--color-background-secondary)]" />
        </div>
        <div className="h-3 w-72 animate-pulse rounded bg-[var(--color-background-secondary)]" />
        <div className="h-3 w-full max-w-md animate-pulse rounded bg-[var(--color-background-secondary)]" />
      </div>
    </div>
  );
}
