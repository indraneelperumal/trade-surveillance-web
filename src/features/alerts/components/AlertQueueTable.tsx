"use client";

import {
  severityLabel,
  severityVariant,
  statusLabel,
  statusVariant,
} from "@/features/alerts/adapters/alertView";
import { formatRelativeDate } from "@/lib/utils";
import type { Alert } from "@/types/domain";

// ── Severity stripe colour map ────────────────────────────────────────────
const SEVERITY_STRIPE: Record<string, string> = {
  "severity-high": "var(--sev-high-bar)",
  "severity-med":  "var(--sev-med-bar)",
  "severity-low":  "var(--sev-low-bar)",
  "severity-none": "var(--sev-none-bar)",
};

const SCORE_COLOR = (score: number) => {
  if (score >= 0.8) return "var(--sev-high-bar)";
  if (score >= 0.6) return "var(--sev-med-bar)";
  return "var(--sev-low-bar)";
};

function ScoreBar({ score }: { score: number | null }) {
  if (score == null) return <span style={{ color: "var(--color-text-tertiary)", fontSize: 11 }}>—</span>;
  const pct = Math.round(score * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 80 }}>
      <div style={{
        flex: 1, height: 4, borderRadius: 2,
        background: "var(--color-border-secondary)",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          borderRadius: 2,
          background: SCORE_COLOR(score),
          transition: "width 0.3s ease",
        }} />
      </div>
      <span className="mono" style={{ fontSize: 10, minWidth: 26, textAlign: "right" }}>
        {score.toFixed(2)}
      </span>
    </div>
  );
}

function AnomalyTypePill({ type }: { type: string }) {
  const label = type.replace(/_/g, " ");
  return (
    <span style={{
      display: "inline-block",
      fontSize: 11,
      padding: "2px 7px",
      borderRadius: 4,
      background: "var(--color-background-secondary)",
      color: "var(--color-text-secondary)",
      border: "1px solid var(--color-border-tertiary)",
      fontWeight: 500,
      textTransform: "capitalize",
    }}>
      {label}
    </span>
  );
}

type AlertQueueTableProps = {
  alerts: Alert[];
  selectedAlertId?: string;
  onSelect: (alertId: string) => void;
};

export function AlertQueueTable({ alerts, selectedAlertId, onSelect }: AlertQueueTableProps) {
  if (alerts.length === 0) {
    return (
      <div style={{
        padding: "48px 24px",
        textAlign: "center",
        color: "var(--color-text-tertiary)",
        fontSize: 13,
      }}>
        No alerts match the current filters.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: 12,
      }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-border-tertiary)" }}>
            {["Symbol", "Anomaly type", "Score", "Severity", "Status", "Assignee", "Updated"].map((h) => (
              <th
                key={h}
                style={{
                  padding: "8px 12px 8px 10px",
                  textAlign: "left",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--color-text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                  background: "var(--color-background-primary)",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => {
            const isSelected = selectedAlertId === alert.id;
            const svVariant = severityVariant(alert.severity);
            const stripeColor = SEVERITY_STRIPE[svVariant] ?? "var(--color-border-secondary)";

            return (
              <tr
                key={alert.id}
                onClick={() => onSelect(alert.id)}
                style={{
                  cursor: "pointer",
                  borderBottom: "1px solid var(--color-border-tertiary)",
                  background: isSelected
                    ? "var(--color-accent-subtle)"
                    : "var(--color-background-primary)",
                  transition: "background 0.1s",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = "var(--color-background-secondary)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = "var(--color-background-primary)";
                }}
              >
                {/* Severity stripe — first cell has left border */}
                <td style={{
                  padding: "10px 12px 10px 14px",
                  fontWeight: 600,
                  fontSize: 13,
                  borderLeft: `3px solid ${stripeColor}`,
                  whiteSpace: "nowrap",
                }}>
                  {alert.symbol}
                  {alert.traderId && (
                    <div className="mono" style={{ fontSize: 10, marginTop: 1, color: "var(--color-text-tertiary)" }}>
                      {alert.traderId}
                    </div>
                  )}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <AnomalyTypePill type={alert.anomalyType ?? "unknown"} />
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <ScoreBar score={alert.anomalyScore ?? null} />
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <span className={`sev ${svVariant === "severity-med" ? "sev-med" : svVariant === "severity-high" ? "sev-high" : svVariant === "severity-low" ? "sev-low" : "sev-none"}`}>
                    {severityLabel(alert.severity)}
                  </span>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <span className={`status ${statusVariant(alert.status)}`}>
                    {statusLabel(alert.status)}
                  </span>
                </td>
                <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)", fontSize: 11 }}>
                  {alert.assignee ?? <span style={{ color: "var(--color-text-tertiary)" }}>Unassigned</span>}
                </td>
                <td style={{ padding: "10px 12px", color: "var(--color-text-tertiary)", fontSize: 11, whiteSpace: "nowrap" }}>
                  {formatRelativeDate(alert.updatedAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
