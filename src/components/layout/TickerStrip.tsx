"use client";

import { getMarketPrices, type MarketPrice } from "@/lib/api/endpoints/market";
import { useQuery } from "@tanstack/react-query";

function TickerItem({ item }: { item: MarketPrice }) {
  const up = item.changePct >= 0;
  const color = up ? "#4ade80" : "#f87171";
  const sign = up ? "+" : "";

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: "0 20px",
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}>
      <span style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#e2e8f0",
        letterSpacing: "0.07em",
      }}>
        {item.symbol}
      </span>

      {item.price != null ? (
        <>
          <span style={{
            fontSize: 11,
            color: "#94a3b8",
            fontVariantNumeric: "tabular-nums",
            fontFamily: "var(--font-mono), monospace",
          }}>
            ${item.price.toFixed(2)}
          </span>
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            color,
            fontVariantNumeric: "tabular-nums",
            fontFamily: "var(--font-mono), monospace",
          }}>
            {sign}{item.changePct.toFixed(2)}%
          </span>
        </>
      ) : (
        <span style={{ fontSize: 11, color: "#334155" }}>—</span>
      )}

      {/* Separator dot */}
      <span style={{ color: "#1e293b", fontSize: 16, lineHeight: 1 }}>·</span>
    </span>
  );
}

export function TickerStrip() {
  const { data: prices = [], isError } = useQuery({
    queryKey: ["market-prices"],
    queryFn: getMarketPrices,
    refetchInterval: 60_000,
    staleTime: 55_000,
    retry: 2,
  });

  if (isError || prices.length === 0) return null;

  return (
    <div style={{
      height: 34,
      background: "#080b0f",
      borderBottom: "1px solid #1e2530",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      flexShrink: 0,
      userSelect: "none",
    }}>
      {/* Duplicate items for seamless infinite scroll */}
      <div className="ticker-track">
        {prices.map((p) => <TickerItem key={p.symbol} item={p} />)}
        {prices.map((p) => <TickerItem key={`${p.symbol}-b`} item={p} />)}
      </div>
    </div>
  );
}
