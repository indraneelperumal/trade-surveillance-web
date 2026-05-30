import { Card } from "@/components/ui/Card";
import type { AssigneeOpenCount } from "@/lib/api/endpoints/metrics";

type Props = {
  rows: AssigneeOpenCount[];
};

export function WorkloadPanel({ rows }: Props) {
  const max = Math.max(...rows.map((r) => r.openCount), 1);

  return (
    <Card className="p-4">
      <div className="mb-3">
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
          Team workload
        </div>
        <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">
          Open cases per analyst
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="text-[12px] text-[var(--color-text-secondary)]">No assigned open cases.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.userId}>
              <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
                <span className="truncate font-medium text-[var(--color-text-primary)]">
                  {row.displayName ?? row.email}
                </span>
                <span className="shrink-0 tabular-nums font-semibold">{row.openCount}</span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full"
                style={{ background: "var(--color-background-tertiary)" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(row.openCount / max) * 100}%`,
                    background: "var(--color-accent-default)",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
