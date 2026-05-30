import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/utils";
import type { Trade } from "@/types/domain";

type Props = {
  trades: Trade[];
};

export function RecentTrades({ trades }: Props) {
  return (
    <Card className="p-4">
      <div className="mb-3 text-[11px] tracking-[0.06em] text-[var(--color-text-secondary)] uppercase">
        Recent market activity
      </div>
      {trades.length === 0 ? (
        <p className="text-[12px] text-[var(--color-text-secondary)]">No trades loaded.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left text-[12px]">
            <thead>
              <tr className="border-b border-[var(--color-border-tertiary)] text-[11px] text-[var(--color-text-secondary)]">
                <th className="pb-2 pr-3 font-medium">Symbol</th>
                <th className="pb-2 pr-3 font-medium">Side</th>
                <th className="pb-2 pr-3 font-medium">Price</th>
                <th className="pb-2 pr-3 font-medium">Volume</th>
                <th className="pb-2 pr-3 font-medium">Off-hrs</th>
                <th className="pb-2 pr-3 font-medium">OTC</th>
                <th className="pb-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.id} className="border-b border-[var(--color-border-tertiary)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{t.symbol}</td>
                  <td className="py-2 pr-3">{t.side}</td>
                  <td className="py-2 pr-3 tabular-nums">${t.price.toFixed(2)}</td>
                  <td className="py-2 pr-3 tabular-nums">{t.volume.toLocaleString()}</td>
                  <td className="py-2 pr-3">{t.offHours ? "Yes" : "No"}</td>
                  <td className="py-2 pr-3">{t.otc ? "Yes" : "No"}</td>
                  <td className="py-2 font-mono text-[11px] text-[var(--color-text-secondary)]">
                    {formatDateTime(t.tradedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
