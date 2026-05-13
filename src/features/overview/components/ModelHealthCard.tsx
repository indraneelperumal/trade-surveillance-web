import { Card } from "@/components/ui/Card";
import { formatRelativeDate } from "@/lib/utils";
import type { ModelRun } from "@/types/domain";

type Props = {
  run: ModelRun | undefined;
};

function MeterBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{
      height: 7, borderRadius: 4,
      background: "var(--color-background-tertiary)",
      overflow: "hidden",
    }}>
      <div style={{
        height: "100%",
        width: `${Math.min(value * 100, 100)}%`,
        background: color,
        borderRadius: 4,
        transition: "width 0.5s ease",
      }} />
    </div>
  );
}

function Metric({ label, value, color, meter }: {
  label: string;
  value: string;
  color?: string;
  meter?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{label}</span>
        <span style={{
          fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums",
          color: color ?? "var(--color-text-primary)",
        }}>
          {value}
        </span>
      </div>
      {meter != null && (
        <MeterBar value={meter} color={color ?? "var(--color-accent-default)"} />
      )}
    </div>
  );
}

function pct(n: number | null | undefined): string {
  if (typeof n !== "number" || isNaN(n)) return "—";
  return `${Math.round(n * 100)}%`;
}

function f1(precision: number | null | undefined, recall: number | null | undefined): string {
  if (typeof precision !== "number" || typeof recall !== "number") return "—";
  if (precision + recall === 0) return "0%";
  return `${Math.round((2 * precision * recall) / (precision + recall) * 100)}%`;
}

export function ModelHealthCard({ run }: Props) {
  return (
    <Card className="p-4 h-full">
      <div className="mb-1 text-[11px] tracking-[0.06em] text-[var(--color-text-secondary)] uppercase">
        Model health
      </div>

      {/* Status + model name row */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
        {run ? (
          <>
            <span style={{
              display: "inline-block", width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
              background: run.status === "COMPLETED" ? "#4ade80"
                        : run.status === "FAILED"    ? "#ef4444"
                        : "#f59e0b",
            }} />
            <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
              {run.modelName ?? run.scoringMode ?? "IsolationForest"}
            </span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--color-text-tertiary)" }}>
              {formatRelativeDate(run.createdAt)}
            </span>
          </>
        ) : (
          <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>No runs yet</span>
        )}
      </div>

      {!run ? (
        <p style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
          Run the ML pipeline to see model metrics.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Metric
            label="Precision"
            value={pct(run.precision)}
            meter={run.precision ?? undefined}
            color="#4ade80"
          />
          <Metric
            label="Recall"
            value={pct(run.recall)}
            meter={run.recall ?? undefined}
            color="#60a5fa"
          />
          <Metric
            label="F1 Score"
            value={f1(run.precision, run.recall)}
            color="var(--color-text-secondary)"
          />

          <div style={{ height: 1, background: "var(--color-border-tertiary)" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Flagged</span>
              <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                {run.flaggedCount != null ? run.flaggedCount.toLocaleString() : "—"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Total records</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                {run.totalRecords != null ? run.totalRecords.toLocaleString() : "—"}
              </span>
            </div>
            {run.runtimeSeconds != null && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Runtime</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  {run.runtimeSeconds.toFixed(1)}s
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
