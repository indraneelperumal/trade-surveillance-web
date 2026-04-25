import type { Trade } from "@/types/domain";

export function TradeSnapshot({ trade }: { trade?: Trade | null }) {
  if (!trade) {
    return <div className="text-[12px] text-[var(--color-text-secondary)]">No linked trade.</div>;
  }

  return (
    <div className="space-y-2 text-[12px]">
      <div className="flex justify-between">
        <span className="text-[var(--color-text-secondary)]">Symbol</span>
        <span className="font-medium">{trade.symbol}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[var(--color-text-secondary)]">Price</span>
        <span className="font-medium">${trade.price.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[var(--color-text-secondary)]">Volume</span>
        <span className="font-medium">{trade.volume.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[var(--color-text-secondary)]">Side</span>
        <span className="font-medium">{trade.side}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[var(--color-text-secondary)]">Timestamp</span>
        <span className="mono">{trade.tradedAt}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[var(--color-text-secondary)]">Off-hours</span>
        <span className="font-medium">{trade.offHours ? "Yes" : "No"}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[var(--color-text-secondary)]">OTC</span>
        <span className="font-medium">{trade.otc ? "Yes" : "No"}</span>
      </div>
    </div>
  );
}
