import { Card } from "@/components/ui/Card";

type Entry = { label: string; count: number };

const PALETTE = ["#378ADD", "#5BA3E8", "#8FC4F0", "#C5DFF7", "#6B7C93", "#9AA5B4"];

function barFromEntries(title: string, entries: Entry[]) {
  const total = entries.reduce((s, e) => s + e.count, 0);
  return (
    <Card className="p-4">
      <div className="mb-2 text-[11px] tracking-[0.06em] text-[var(--color-text-secondary)] uppercase">
        {title}
      </div>
      {total === 0 ? (
        <p className="text-[12px] text-[var(--color-text-secondary)]">No data.</p>
      ) : (
        <>
          <div className="mb-2 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-background-secondary)]">
            {entries.map((e, i) => {
              const pct = (e.count / total) * 100;
              return (
                <div
                  key={e.label}
                  title={`${e.label}: ${e.count}`}
                  className="h-full min-w-[2px] transition-[width]"
                  style={{ width: `${pct}%`, backgroundColor: PALETTE[i % PALETTE.length] }}
                />
              );
            })}
          </div>
          <ul className="space-y-1 text-[12px]">
            {entries.map((e, i) => (
              <li key={e.label} className="flex justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-sm"
                    style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                  />
                  {e.label}
                </span>
                <span className="tabular-nums font-medium">{e.count}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

function toEntries(record: Record<string, number>, labelize: (k: string) => string): Entry[] {
  return Object.entries(record)
    .map(([k, count]) => ({ label: labelize(k), count }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count);
}

type Props = {
  alertsByStatus: Record<string, number>;
  alertsBySeverity: Record<string, number>;
  alertsByAnomalyType: Record<string, number>;
  openAlertsBySeverity: Record<string, number>;
};

export function DistributionStrip({
  alertsByStatus,
  alertsBySeverity,
  alertsByAnomalyType,
  openAlertsBySeverity,
}: Props) {
  const statusEntries = toEntries(alertsByStatus, (k) =>
    k === "in-progress" ? "In progress" : k.charAt(0).toUpperCase() + k.slice(1),
  );
  const sevEntries = toEntries(alertsBySeverity, (k) =>
    k === "med" ? "Medium" : k.charAt(0).toUpperCase() + k.slice(1),
  );
  const anomalyEntries = toEntries(alertsByAnomalyType, (k) => k.replace(/_/g, " "));
  const openSevEntries = toEntries(openAlertsBySeverity, (k) =>
    k === "med" ? "Medium" : k.charAt(0).toUpperCase() + k.slice(1),
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {barFromEntries("Queue by status", statusEntries)}
      {barFromEntries("All alerts by severity", sevEntries)}
      {barFromEntries("Detection mix (anomaly type)", anomalyEntries)}
      {barFromEntries("Open alerts by severity", openSevEntries)}
    </div>
  );
}
