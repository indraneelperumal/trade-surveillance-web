import type { ReactNode } from "react";
import type { Alert, Trade } from "@/types/domain";

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-[var(--color-text-secondary)]">{label}</span>
      <span className="max-w-[60%] text-right font-medium">{value}</span>
    </div>
  );
}

export function TradeSnapshot({
  trade,
  alert,
}: {
  trade?: Trade | null;
  alert?: Alert | null;
}) {
  if (!trade) {
    return <div className="text-[12px] text-[var(--color-text-secondary)]">No linked trade.</div>;
  }

  return (
    <div className="space-y-2 text-[12px]">
      <Row label="Symbol" value={trade.symbol} />
      {trade.exchange ? <Row label="Exchange" value={trade.exchange} /> : null}
      {trade.traderId ? <Row label="Trader" value={<span className="mono">{trade.traderId}</span>} /> : null}
      <Row label="Price" value={`$${trade.price.toFixed(2)}`} />
      {typeof trade.tradeValue === "number" ? (
        <Row label="Notional" value={`$${trade.tradeValue.toLocaleString()}`} />
      ) : null}
      <Row label="Volume" value={trade.volume.toLocaleString()} />
      <Row label="Side" value={trade.side} />
      <Row label="Timestamp" value={<span className="mono text-[11px]">{trade.tradedAt}</span>} />
      <Row label="Off-hours" value={trade.offHours ? "Yes" : "No"} />
      <Row label="OTC" value={trade.otc ? "Yes" : "No"} />
      {alert && typeof alert.anomalyScore === "number" ? (
        <Row label="Anomaly score" value={alert.anomalyScore.toFixed(4)} />
      ) : null}
      {alert?.topShapFeature ? (
        <Row label="Top SHAP feature" value={<span className="mono text-[11px]">{alert.topShapFeature}</span>} />
      ) : null}
    </div>
  );
}
