import { Card } from "@/components/ui/Card";
import type { OverviewMetrics } from "@/lib/api/endpoints/metrics";

type Props = {
  metrics: OverviewMetrics | null;
};

function KpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card className="p-3">
      <div className="mb-1 text-[11px] tracking-[0.06em] text-[var(--color-text-secondary)] uppercase">
        {label}
      </div>
      <div className="text-[22px] font-semibold tabular-nums text-[var(--color-text-primary)]">
        {value}
      </div>
      {sub ? <div className="mt-1 text-[11px] text-[var(--color-text-secondary)]">{sub}</div> : null}
    </Card>
  );
}

export function OverviewKpiStrip({ metrics }: Props) {
  if (!metrics) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-3">
            <div className="text-[12px] text-[var(--color-text-secondary)]">—</div>
          </Card>
        ))}
      </div>
    );
  }

  const open = metrics.alertsByStatus["open"] ?? 0;
  const inProg = metrics.alertsByStatus["in-progress"] ?? 0;
  const closed = metrics.alertsByStatus["closed"] ?? 0;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      <KpiCard label="Open alerts" value={open} sub="Queue depth" />
      <KpiCard label="In progress" value={inProg} />
      <KpiCard label="Closed" value={closed} />
      <KpiCard label="Open · high sev." value={metrics.openHighSeverityCount} sub="Needs attention" />
      <KpiCard label="Trades in book" value={metrics.totalTrades} sub={`${metrics.totalAlerts} alerts total`} />
    </div>
  );
}
