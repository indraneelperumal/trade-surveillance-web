import { Card } from "@/components/ui/Card";

const ANOMALY_COLORS: Record<string, string> = {
  multi_flag:   "#ef4444",
  fat_finger:   "#f97316",
  wash_trade:   "#f59e0b",
  spoofing:     "#a855f7",
  volume_spike: "#3b82f6",
  off_hours:    "#6b7280",
  unknown:      "#374151",
};

const ANOMALY_LABELS: Record<string, string> = {
  multi_flag:   "Multi Flag",
  fat_finger:   "Fat Finger",
  wash_trade:   "Wash Trade",
  spoofing:     "Spoofing",
  volume_spike: "Volume Spike",
  off_hours:    "Off Hours",
  unknown:      "Unknown",
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number): string {
  const s = polarToCartesian(cx, cy, r, start);
  const e = polarToCartesian(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${s.x.toFixed(3)} ${s.y.toFixed(3)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(3)} ${e.y.toFixed(3)}`;
}

type Props = {
  alertsByAnomalyType: Record<string, number>;
};

export function AnomalyDonut({ alertsByAnomalyType }: Props) {
  const entries = Object.entries(alertsByAnomalyType)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  const total = entries.reduce((s, [, c]) => s + c, 0);

  const CX = 80, CY = 80, R = 56, SW = 20, GAP = 1.5;

  let cursor = 0;
  const segments = entries.map(([key, count]) => {
    const sweep = (count / total) * 360;
    const start = cursor + GAP;
    const end = cursor + sweep - GAP;
    cursor += sweep;
    return { key, count, start, end, color: ANOMALY_COLORS[key] ?? "#6b7280" };
  });

  return (
    <Card className="p-4 h-full">
      <div className="mb-3 text-[11px] tracking-[0.06em] text-[var(--color-text-secondary)] uppercase">
        Detection mix · anomaly type
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>

        {/* SVG Donut */}
        <div style={{ flexShrink: 0 }}>
          <svg width={160} height={160} viewBox="0 0 160 160">
            {/* Track ring */}
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke="var(--color-background-tertiary)"
              strokeWidth={SW}
            />
            {/* Segments */}
            {total > 0 && segments.map((seg) => (
              <path
                key={seg.key}
                d={arcPath(CX, CY, R, seg.start, seg.end)}
                fill="none"
                stroke={seg.color}
                strokeWidth={SW}
                strokeLinecap="butt"
              />
            ))}
            {/* Centre label */}
            <text
              x={CX} y={CY - 8}
              textAnchor="middle"
              style={{ fontSize: 22, fontWeight: 700, fill: "var(--color-text-primary)", fontFamily: "inherit" }}
            >
              {total.toLocaleString()}
            </text>
            <text
              x={CX} y={CY + 10}
              textAnchor="middle"
              style={{ fontSize: 10, fill: "var(--color-text-tertiary)", fontFamily: "inherit", letterSpacing: "0.06em", textTransform: "uppercase" }}
            >
              alerts
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 7 }}>
          {segments.map((seg) => {
            const pct = total > 0 ? ((seg.count / total) * 100).toFixed(1) : "0";
            return (
              <div key={seg.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: 2,
                  background: seg.color, flexShrink: 0,
                }} />
                <span style={{ flex: 1, color: "var(--color-text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {ANOMALY_LABELS[seg.key] ?? seg.key}
                </span>
                <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--color-text-primary)", fontWeight: 600, flexShrink: 0 }}>
                  {seg.count.toLocaleString()}
                </span>
                <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--color-text-tertiary)", fontSize: 11, width: 38, textAlign: "right", flexShrink: 0 }}>
                  {pct}%
                </span>
              </div>
            );
          })}
          {total === 0 && (
            <p style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>No anomaly data.</p>
          )}
        </div>
      </div>
    </Card>
  );
}
