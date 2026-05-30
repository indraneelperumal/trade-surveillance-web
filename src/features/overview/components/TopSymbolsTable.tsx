import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { SymbolAlertCount } from "@/lib/api/endpoints/metrics";

type Props = {
  rows: SymbolAlertCount[];
  totalAlerts: number;
};

export function TopSymbolsTable({ rows, totalAlerts }: Props) {
  const max = rows[0]?.count ?? 1;

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[var(--color-border-tertiary)] px-4 py-3">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
          Top symbols by alert volume
        </div>
        <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">
          Concentration risk — drill into symbol from the work queue
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="p-4 text-[12px] text-[var(--color-text-secondary)]">No symbol concentration data.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left text-[12px]">
            <thead>
              <tr className="border-b border-[var(--color-border-tertiary)] text-[10px] uppercase tracking-wide text-[var(--color-text-tertiary)]">
                <th className="px-4 py-2 font-semibold">Rank</th>
                <th className="px-4 py-2 font-semibold">Symbol</th>
                <th className="px-4 py-2 font-semibold text-right">Alerts</th>
                <th className="px-4 py-2 font-semibold text-right">% of book</th>
                <th className="px-4 py-2 font-semibold">Intensity</th>
                <th className="px-4 py-2 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const pct = totalAlerts > 0 ? (r.count / totalAlerts) * 100 : 0;
                return (
                  <tr key={r.symbol} className="border-b border-[var(--color-border-tertiary)] last:border-0">
                    <td className="px-4 py-2.5 text-[var(--color-text-tertiary)]">{i + 1}</td>
                    <td className="px-4 py-2.5 text-[14px] font-bold tracking-tight">{r.symbol}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold">{r.count.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[var(--color-text-secondary)]">
                      {pct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="h-1.5 w-full max-w-[100px] overflow-hidden rounded-full bg-[var(--color-background-tertiary)]">
                        <div
                          className="h-full rounded-full bg-[var(--sev-med-bar)]"
                          style={{ width: `${(r.count / max) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        href={`/queue?symbol=${encodeURIComponent(r.symbol)}&view=open`}
                        className="text-[11px] font-medium text-[var(--color-accent-default)] hover:underline"
                      >
                        Queue
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
