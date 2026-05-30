"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { SYMBOL_BAR_PALETTE } from "@/features/overview/charts/chartUtils";
import type { SymbolAlertCount } from "@/lib/api/endpoints/metrics";
import { ArrowRight, TrendingUp } from "lucide-react";

type Props = {
  rows: SymbolAlertCount[];
  totalAlerts: number;
};

export function TopSymbolsChart({ rows, totalAlerts }: Props) {
  const max = rows[0]?.count ?? 1;
  const gridTicks = [0.25, 0.5, 0.75, 1];

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border-tertiary)] px-4 py-3 md:px-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
            <TrendingUp size={14} className="text-[var(--color-accent-default)]" />
            Symbol concentration
          </div>
          <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">
            Alert volume by ticker — relative intensity vs. book total
          </p>
        </div>
        <Link
          href="/queue?view=open"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-accent-default)] hover:underline"
        >
          All symbols
          <ArrowRight size={12} />
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="p-5 text-[12px] text-[var(--color-text-secondary)]">No symbol concentration data.</p>
      ) : (
        <div className="px-4 py-4 md:px-5">
          <div className="relative">
            <div
              className="pointer-events-none absolute bottom-6 left-[7.5rem] right-[5.5rem] top-0 flex justify-between"
              aria-hidden
            >
              {gridTicks.map((t) => (
                <div
                  key={t}
                  className="h-full border-l border-dashed border-[var(--color-border-tertiary)] opacity-60"
                />
              ))}
            </div>

            <ul className="relative space-y-3">
              {rows.map((row, i) => {
                const pct = totalAlerts > 0 ? (row.count / totalAlerts) * 100 : 0;
                const widthPct = (row.count / max) * 100;
                const color = SYMBOL_BAR_PALETTE[i % SYMBOL_BAR_PALETTE.length];

                return (
                  <li key={row.symbol}>
                    <Link
                      href={`/queue?symbol=${encodeURIComponent(row.symbol)}&view=open`}
                      className="group grid grid-cols-[7rem_1fr_5rem] items-center gap-3 rounded-lg px-1 py-1.5 transition hover:bg-[var(--color-background-secondary)] md:grid-cols-[7.5rem_1fr_5.5rem]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-background-tertiary)] text-[9px] font-bold tabular-nums text-[var(--color-text-tertiary)]">
                          {i + 1}
                        </span>
                        <span className="truncate text-[13px] font-bold tracking-tight text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-default)]">
                          {row.symbol}
                        </span>
                      </div>

                      <div className="relative h-7 min-w-0">
                        <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                          <div
                            className="overview-chart-bar h-5 w-full max-w-full overflow-hidden rounded-md bg-[var(--color-background-tertiary)]"
                            style={{ maxWidth: "100%" }}
                          >
                            <div
                              className="overview-chart-bar__fill h-full rounded-md"
                              style={{
                                width: `${widthPct}%`,
                                background: `linear-gradient(90deg, ${color} 0%, ${color}cc 55%, ${color}66 100%)`,
                                boxShadow: `0 0 12px ${color}33`,
                                animationDelay: `${i * 60}ms`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[13px] font-bold tabular-nums leading-none">
                          {row.count.toLocaleString()}
                        </div>
                        <div className="mt-0.5 text-[10px] tabular-nums text-[var(--color-text-tertiary)]">
                          {pct.toFixed(1)}%
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-2 flex justify-between pl-[7.5rem] pr-[5.5rem] text-[9px] tabular-nums text-[var(--color-text-tertiary)]">
              <span>0</span>
              <span>{Math.round(max * 0.25).toLocaleString()}</span>
              <span>{Math.round(max * 0.5).toLocaleString()}</span>
              <span>{Math.round(max * 0.75).toLocaleString()}</span>
              <span>{max.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
