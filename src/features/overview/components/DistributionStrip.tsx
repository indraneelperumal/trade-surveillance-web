import { Card } from "@/components/ui/Card";

const STATUS_COLORS: Record<string, string> = {
  "Open":        "#3b82f6",
  "In progress": "#f59e0b",
  "Closed":      "#4ade80",
  "Escalated":   "#a855f7",
};

const SEV_COLORS: Record<string, string> = {
  "High":   "var(--sev-high-bar)",
  "Medium": "var(--sev-med-bar)",
  "Low":    "var(--sev-low-bar)",
  "None":   "var(--sev-none-bar)",
};

type Entry = { label: string; count: number; color: string };

function BarCard({ title, entries }: { title: string; entries: Entry[] }) {
  const total = entries.reduce((s, e) => s + e.count, 0);

  return (
    <Card className="p-4">
      <div className="mb-3 text-[11px] tracking-[0.06em] text-[var(--color-text-secondary)] uppercase">
        {title}
      </div>
      {total === 0 ? (
        <p className="text-[12px] text-[var(--color-text-secondary)]">No data.</p>
      ) : (
        <>
          {/* Segmented bar */}
          <div style={{
            display: "flex", height: 8, width: "100%",
            borderRadius: 6, overflow: "hidden",
            background: "var(--color-background-tertiary)",
            marginBottom: 14, gap: 2,
          }}>
            {entries.map((e) => (
              <div
                key={e.label}
                title={`${e.label}: ${e.count}`}
                style={{
                  height: "100%",
                  width: `${(e.count / total) * 100}%`,
                  background: e.color,
                  minWidth: e.count > 0 ? 3 : 0,
                  transition: "width 0.4s ease",
                }}
              />
            ))}
          </div>

          {/* Legend rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {entries.map((e) => (
              <div key={e.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <span style={{
                  width: 9, height: 9, borderRadius: 2,
                  background: e.color, flexShrink: 0,
                }} />
                <span style={{ flex: 1, color: "var(--color-text-secondary)" }}>{e.label}</span>
                <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                  {e.count.toLocaleString()}
                </span>
                <span style={{ width: 38, textAlign: "right", fontSize: 11, color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums" }}>
                  {((e.count / total) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

function toEntries(
  record: Record<string, number>,
  labelMap: (k: string) => string,
  colorMap: Record<string, string>,
): Entry[] {
  return Object.entries(record)
    .map(([k, count]) => ({
      label: labelMap(k),
      count,
      color: colorMap[labelMap(k)] ?? "#6b7280",
    }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count);
}

type Props = {
  alertsByStatus: Record<string, number>;
  openAlertsBySeverity: Record<string, number>;
};

export function DistributionStrip({ alertsByStatus, openAlertsBySeverity }: Props) {
  const statusEntries = toEntries(
    alertsByStatus,
    (k) => k === "in-progress" ? "In progress" : k.charAt(0).toUpperCase() + k.slice(1),
    STATUS_COLORS,
  );

  const sevEntries = toEntries(
    openAlertsBySeverity,
    (k) => k === "med" ? "Medium" : k.charAt(0).toUpperCase() + k.slice(1),
    SEV_COLORS,
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <BarCard title="Queue by status" entries={statusEntries} />
      <BarCard title="Open alerts by severity" entries={sevEntries} />
    </div>
  );
}
