import { Card } from "@/components/ui/Card";
import type { SymbolAlertCount } from "@/lib/api/endpoints/metrics";

type Props = {
  rows: SymbolAlertCount[];
};

export function TopSymbols({ rows }: Props) {
  return (
    <Card className="p-4">
      <div className="mb-3 text-[11px] tracking-[0.06em] text-[var(--color-text-secondary)] uppercase">
        Top symbols by alerts
      </div>
      {rows.length === 0 ? (
        <p className="text-[12px] text-[var(--color-text-secondary)]">No concentration data.</p>
      ) : (
        <ol className="space-y-2 text-[12px]">
          {rows.map((r, i) => (
            <li key={r.symbol} className="flex items-center justify-between gap-2">
              <span className="text-[var(--color-text-secondary)]">
                {i + 1}. <span className="font-semibold text-[var(--color-text-primary)]">{r.symbol}</span>
              </span>
              <span className="tabular-nums font-medium">{r.count}</span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
