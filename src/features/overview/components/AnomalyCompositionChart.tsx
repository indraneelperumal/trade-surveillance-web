"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { anomalyChartColor, arcPath } from "@/features/overview/charts/chartUtils";
import { anomalyLabel } from "@/lib/domain/labels";
import { ArrowRight, PieChart } from "lucide-react";

type Props = {
  alertsByAnomalyType: Record<string, number>;
};

export function AnomalyCompositionChart({ alertsByAnomalyType }: Props) {
  const entries = Object.entries(alertsByAnomalyType)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  const total = entries.reduce((s, [, c]) => s + c, 0);
  const max = entries[0]?.[1] ?? 1;

  const CX = 88;
  const CY = 88;
  const R = 62;
  const SW = 22;
  const GAP = 2;

  let cursor = 0;
  const segments = entries.map(([key, count], i) => {
    const sweep = total > 0 ? (count / total) * 360 : 0;
    const start = cursor + GAP;
    const end = cursor + sweep - GAP;
    cursor += sweep;
    return {
      key,
      count,
      start,
      end,
      color: anomalyChartColor(key, i),
    };
  });

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border-tertiary)] px-4 py-3 md:px-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
            <PieChart size={14} className="text-[var(--color-accent-default)]" />
            Detection mix
          </div>
          <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">
            Share of alerts by surveillance rule type
          </p>
        </div>
        <Link
          href="/queue"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-accent-default)] hover:underline"
        >
          Filter in queue
          <ArrowRight size={12} />
        </Link>
      </div>

      {total === 0 ? (
        <p className="p-5 text-[12px] text-[var(--color-text-secondary)]">No anomaly data.</p>
      ) : (
        <div className="flex flex-col gap-5 p-4 md:flex-row md:items-center md:gap-8 md:p-5">
          <div className="mx-auto shrink-0 md:mx-0">
            <svg width={176} height={176} viewBox="0 0 176 176" className="overview-donut-chart">
              <circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke="var(--color-background-tertiary)"
                strokeWidth={SW}
              />
              {segments.map((seg) => (
                <path
                  key={seg.key}
                  d={arcPath(CX, CY, R, seg.start, seg.end)}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={SW}
                  strokeLinecap="round"
                  className="overview-donut-segment"
                />
              ))}
              <text
                x={CX}
                y={CY - 6}
                textAnchor="middle"
                className="fill-[var(--color-text-primary)] text-[22px] font-bold"
                style={{ fontFamily: "inherit" }}
              >
                {total.toLocaleString()}
              </text>
              <text
                x={CX}
                y={CY + 12}
                textAnchor="middle"
                className="fill-[var(--color-text-tertiary)] text-[9px] font-semibold uppercase tracking-wider"
                style={{ fontFamily: "inherit" }}
              >
                alerts
              </text>
            </svg>
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            {segments.map((seg, i) => {
              const pct = total > 0 ? (seg.count / total) * 100 : 0;
              const barPct = (seg.count / max) * 100;

              return (
                <div key={seg.key} className="group">
                  <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{ background: seg.color, boxShadow: `0 0 8px ${seg.color}44` }}
                      />
                      <span className="truncate font-medium capitalize text-[var(--color-text-primary)]">
                        {anomalyLabel(seg.key)}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-baseline gap-2 tabular-nums">
                      <span className="font-bold">{seg.count.toLocaleString()}</span>
                      <span className="w-10 text-right text-[10px] text-[var(--color-text-tertiary)]">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--color-background-tertiary)]">
                    <div
                      className="overview-chart-bar__fill h-full rounded-full"
                      style={{
                        width: `${barPct}%`,
                        background: `linear-gradient(90deg, ${seg.color}, ${seg.color}99)`,
                        animationDelay: `${i * 50}ms`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
