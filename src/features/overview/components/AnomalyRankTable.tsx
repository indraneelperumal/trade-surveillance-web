import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { anomalyLabel } from "@/lib/domain/labels";

type Props = {
  alertsByAnomalyType: Record<string, number>;
};

export function AnomalyRankTable({ alertsByAnomalyType }: Props) {
  const rows = Object.entries(alertsByAnomalyType)
    .filter(([, c]) => c > 0)
    .sort(([, a], [, b]) => b - a);
  const total = rows.reduce((s, [, c]) => s + c, 0);

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[var(--color-border-tertiary)] px-4 py-3">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
          Anomaly types ranked
        </div>
        <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">
          Where surveillance volume concentrates — not individual cases
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="p-4 text-[12px] text-[var(--color-text-secondary)]">No anomaly data.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left text-[12px]">
            <thead>
              <tr className="border-b border-[var(--color-border-tertiary)] text-[10px] uppercase tracking-wide text-[var(--color-text-tertiary)]">
                <th className="px-4 py-2 font-semibold">#</th>
                <th className="px-4 py-2 font-semibold">Type</th>
                <th className="px-4 py-2 font-semibold text-right">Alerts</th>
                <th className="px-4 py-2 font-semibold text-right">Share</th>
                <th className="px-4 py-2 font-semibold text-right">Bar</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([type, count], i) => {
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <tr key={type} className="border-b border-[var(--color-border-tertiary)] last:border-0">
                    <td className="px-4 py-2.5 text-[var(--color-text-tertiary)]">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium capitalize">{anomalyLabel(type)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold">{count.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[var(--color-text-secondary)]">
                      {pct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="ml-auto h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-[var(--color-background-tertiary)]">
                        <div
                          className="h-full rounded-full bg-[var(--color-accent-default)]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="border-t border-[var(--color-border-tertiary)] px-4 py-2 text-right">
        <Link href="/queue" className="text-[11px] font-medium text-[var(--color-accent-default)] hover:underline">
          Filter in queue →
        </Link>
      </div>
    </Card>
  );
}
