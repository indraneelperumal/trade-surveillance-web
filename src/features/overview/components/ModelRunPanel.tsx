import { Card } from "@/components/ui/Card";
import type { ModelRun } from "@/types/domain";

type Props = {
  runs: ModelRun[];
};

function pct(n: number | null | undefined) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return `${Math.round(n * 100)}%`;
}

export function ModelRunPanel({ runs }: Props) {
  const [latest, prev] = runs;

  return (
    <Card className="p-4">
      <div className="mb-3 text-[11px] tracking-[0.06em] text-[var(--color-text-secondary)] uppercase">
        Model runs
      </div>
      {!latest ? (
        <p className="text-[12px] text-[var(--color-text-secondary)]">No model runs yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-1 text-[11px] text-[var(--color-text-secondary)]">Latest</div>
            <div className="space-y-1.5 text-[12px]">
              <div className="flex justify-between gap-2">
                <span className="text-[var(--color-text-secondary)]">Run ID</span>
                <span className="mono text-[11px]">{latest.id}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[var(--color-text-secondary)]">Status</span>
                <span className="font-medium">{latest.status}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[var(--color-text-secondary)]">Precision</span>
                <span>{pct(latest.precision)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[var(--color-text-secondary)]">Recall</span>
                <span>{pct(latest.recall)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[var(--color-text-secondary)]">Flagged</span>
                <span className="tabular-nums">
                  {typeof latest.flaggedCount === "number" ? latest.flaggedCount.toLocaleString() : "—"}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[var(--color-text-secondary)]">Total records</span>
                <span className="tabular-nums">
                  {typeof latest.totalRecords === "number" ? latest.totalRecords.toLocaleString() : "—"}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[var(--color-text-secondary)]">Runtime</span>
                <span>
                  {typeof latest.runtimeSeconds === "number" ? `${latest.runtimeSeconds.toFixed(1)}s` : "—"}
                </span>
              </div>
            </div>
          </div>
          {prev ? (
            <div>
              <div className="mb-1 text-[11px] text-[var(--color-text-secondary)]">Previous</div>
              <div className="space-y-1.5 text-[12px]">
                <div className="flex justify-between gap-2">
                  <span className="text-[var(--color-text-secondary)]">Run ID</span>
                  <span className="mono text-[11px]">{prev.id}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[var(--color-text-secondary)]">Status</span>
                  <span className="font-medium">{prev.status}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[var(--color-text-secondary)]">Precision</span>
                  <span>{pct(prev.precision)}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </Card>
  );
}
