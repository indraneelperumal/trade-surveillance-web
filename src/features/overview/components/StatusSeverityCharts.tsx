"use client";

import { Card } from "@/components/ui/Card";
import { arcPath } from "@/features/overview/charts/chartUtils";

const STATUS_COLORS: Record<string, string> = {
  Open: "#3b82f6",
  "In progress": "#f59e0b",
  Closed: "#22c55e",
  Escalated: "#a855f7",
  "Pending officer review": "#6366f1",
};

const SEV_COLORS: Record<string, string> = {
  High: "var(--sev-high-bar)",
  Medium: "var(--sev-med-bar)",
  Low: "var(--sev-low-bar)",
  None: "var(--sev-none-bar)",
};

type Slice = { label: string; count: number; color: string };

function toSlices(
  record: Record<string, number>,
  labelMap: (k: string) => string,
  colorMap: Record<string, string>,
): Slice[] {
  return Object.entries(record)
    .map(([k, count]) => ({
      label: labelMap(k),
      count,
      color: colorMap[labelMap(k)] ?? "#64748b",
    }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count);
}

function MiniDonut({ title, slices }: { title: string; slices: Slice[] }) {
  const total = slices.reduce((s, e) => s + e.count, 0);
  const CX = 52;
  const CY = 52;
  const R = 36;
  const SW = 14;
  const GAP = 1.5;

  let cursor = 0;
  const segments = slices.map((slice) => {
    const sweep = total > 0 ? (slice.count / total) * 360 : 0;
    const start = cursor + GAP;
    const end = cursor + sweep - GAP;
    cursor += sweep;
    return { ...slice, start, end };
  });

  return (
    <Card className="flex h-full flex-col p-4">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
        {title}
      </div>
      {total === 0 ? (
        <p className="text-[12px] text-[var(--color-text-secondary)]">No data.</p>
      ) : (
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          <svg width={104} height={104} viewBox="0 0 104 104" className="mx-auto shrink-0 sm:mx-0">
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
                key={seg.label}
                d={arcPath(CX, CY, R, seg.start, seg.end)}
                fill="none"
                stroke={seg.color}
                strokeWidth={SW}
                strokeLinecap="round"
              />
            ))}
            <text
              x={CX}
              y={CY + 4}
              textAnchor="middle"
              className="fill-[var(--color-text-primary)] text-[15px] font-bold"
              style={{ fontFamily: "inherit" }}
            >
              {total}
            </text>
          </svg>

          <ul className="min-w-0 flex-1 space-y-2">
            {segments.map((seg) => {
              const pct = total > 0 ? (seg.count / total) * 100 : 0;
              return (
                <li key={seg.label}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span
                        className="h-2 w-2 shrink-0 rounded-sm"
                        style={{ background: seg.color }}
                      />
                      <span className="truncate text-[var(--color-text-secondary)]">{seg.label}</span>
                    </span>
                    <span className="shrink-0 tabular-nums font-semibold">{seg.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-background-tertiary)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: seg.color,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
}

type Props = {
  alertsByStatus: Record<string, number>;
  openAlertsBySeverity: Record<string, number>;
};

export function StatusSeverityCharts({ alertsByStatus, openAlertsBySeverity }: Props) {
  const statusSlices = toSlices(
    alertsByStatus,
    (k) => {
      if (k === "in-progress") return "In progress";
      if (k === "pending-officer-review") return "Pending officer review";
      return k.charAt(0).toUpperCase() + k.slice(1);
    },
    STATUS_COLORS,
  );

  const sevSlices = toSlices(
    openAlertsBySeverity,
    (k) => (k === "med" ? "Medium" : k.charAt(0).toUpperCase() + k.slice(1)),
    SEV_COLORS,
  );

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <MiniDonut title="Queue by status" slices={statusSlices} />
      <MiniDonut title="Open by severity" slices={sevSlices} />
    </div>
  );
}
