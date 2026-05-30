export function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function arcPath(cx: number, cy: number, r: number, start: number, end: number): string {
  const s = polarToCartesian(cx, cy, r, start);
  const e = polarToCartesian(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${s.x.toFixed(3)} ${s.y.toFixed(3)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(3)} ${e.y.toFixed(3)}`;
}

/** Distinct bar colors for ranked symbol rows */
export const SYMBOL_BAR_PALETTE = [
  "#6366f1",
  "#818cf8",
  "#4f46e5",
  "#7c3aed",
  "#2563eb",
  "#0891b2",
  "#0d9488",
  "#64748b",
] as const;

export const ANOMALY_CHART_COLORS: Record<string, string> = {
  multi_flag: "#ef4444",
  fat_finger: "#f97316",
  wash_trade: "#f59e0b",
  spoofing: "#a855f7",
  volume_spike: "#3b82f6",
  off_hours: "#64748b",
  unknown: "#52525b",
};

export function anomalyChartColor(type: string, index: number) {
  return ANOMALY_CHART_COLORS[type] ?? SYMBOL_BAR_PALETTE[index % SYMBOL_BAR_PALETTE.length];
}
