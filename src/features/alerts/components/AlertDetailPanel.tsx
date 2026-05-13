"use client";

import { Badge } from "@/components/ui/Badge";
import {
  severityLabel,
  severityVariant,
  statusLabel,
  statusVariant,
} from "@/features/alerts/adapters/alertView";
import { AlertActionsForm, type AlertActionValues } from "@/features/alerts/components/AlertActionsForm";
import { InvestigationSummary } from "@/features/alerts/components/InvestigationSummary";
import { NotesTimeline } from "@/features/alerts/components/NotesTimeline";
import { ShapFeatureBar } from "@/features/alerts/components/ShapFeatureBar";
import { TradeSnapshot } from "@/features/alerts/components/TradeSnapshot";
import type { Alert, Investigation, InvestigationNote, Trade } from "@/types/domain";
import { Bot, Sparkles, X } from "lucide-react";
import React from "react";

type AlertDetailPanelProps = {
  alert?: Alert;
  trade?: Trade | null;
  investigation?: Investigation | null;
  notes: InvestigationNote[];
  isRunning?: boolean;
  onRunInvestigation?: () => void;
  onSubmitAction: (values: AlertActionValues) => void;
  onClose?: () => void;
  appRole?: string | null;
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--color-text-tertiary)",
      marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--color-border-tertiary)", margin: "0 -1px" }} />;
}

export function AlertDetailPanel({
  alert,
  trade,
  investigation,
  notes,
  isRunning = false,
  onRunInvestigation,
  onSubmitAction,
  onClose,
  appRole,
}: AlertDetailPanelProps) {
  if (!alert) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: 10,
        color: "var(--color-text-tertiary)",
        padding: 32,
        textAlign: "center",
      }}>
        <Bot size={32} strokeWidth={1.2} />
        <div style={{ fontSize: 13, fontWeight: 500 }}>Select an alert to inspect</div>
        <div style={{ fontSize: 12 }}>
          Click any row in the queue to load the trade detail and run an AI investigation.
        </div>
      </div>
    );
  }

  const svVariant = severityVariant(alert.severity);
  const canTrigger = !investigation && !isRunning && alert.status !== "closed" &&
    (alert.severity === "high" || alert.severity === "med");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        padding: "14px 16px 12px",
        borderBottom: "1px solid var(--color-border-tertiary)",
        background: "var(--color-background-primary)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>{alert.symbol}</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginTop: 2 }}>
              {alert.id.slice(0, 8)}…
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: "var(--color-text-tertiary)", padding: 2, borderRadius: 4,
                display: "flex", alignItems: "center",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Badge variant={severityVariant(alert.severity)}>{severityLabel(alert.severity)}</Badge>
          <Badge variant={statusVariant(alert.status)}>{statusLabel(alert.status)}</Badge>
          {alert.anomalyType && (
            <span style={{
              fontSize: 11, padding: "2px 7px", borderRadius: 4, fontWeight: 500,
              background: "var(--color-background-secondary)",
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-border-tertiary)",
              textTransform: "capitalize",
            }}>
              {alert.anomalyType.replace(/_/g, " ")}
            </span>
          )}
        </div>
      </div>

      {/* ── Scrollable content ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* ── AI Investigation CTA ─────────────────────────────────────────── */}
        <div style={{ padding: "14px 16px 0" }}>
          {isRunning ? (
            <div
              className="agent-running"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 9, padding: "12px 16px", borderRadius: 8,
                background: "#0f172a", border: "1px solid #1d4ed8",
                color: "#93c5fd", fontSize: 13, fontWeight: 600,
              }}
            >
              <Bot size={15} />
              Agent running…
            </div>
          ) : investigation ? (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
              borderRadius: 8, background: "var(--color-background-secondary)",
              border: "1px solid var(--color-border-secondary)",
              fontSize: 12, color: "var(--color-text-secondary)",
            }}>
              <Sparkles size={13} style={{ color: "var(--color-accent-default)", flexShrink: 0 }} />
              <span style={{ flex: 1 }}>Investigation complete — see results below</span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 3,
                background: investigation.verdict === "ESCALATE" ? "var(--sev-high-bg)" :
                            investigation.verdict === "MONITOR" ? "var(--sev-med-bg)" : "var(--status-closed-bg)",
                color: investigation.verdict === "ESCALATE" ? "var(--sev-high-text)" :
                       investigation.verdict === "MONITOR" ? "var(--sev-med-text)" : "var(--status-closed-text)",
              }}>
                {investigation.verdict ?? "—"}
              </span>
            </div>
          ) : canTrigger ? (
            <button
              onClick={onRunInvestigation}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 9, width: "100%", padding: "13px 16px",
                borderRadius: 8, cursor: "pointer",
                background: "#0f172a",
                border: "1px solid #334155",
                color: "#f8fafc",
                fontSize: 13, fontWeight: 600,
                letterSpacing: "0.01em",
                transition: "border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#3b82f6";
                (e.currentTarget as HTMLButtonElement).style.background = "#1e293b";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#334155";
                (e.currentTarget as HTMLButtonElement).style.background = "#0f172a";
              }}
            >
              <Sparkles size={15} style={{ color: "#818cf8" }} />
              Run AI Investigation
            </button>
          ) : (
            <div style={{
              padding: "10px 14px", borderRadius: 8, fontSize: 12,
              background: "var(--color-background-secondary)",
              color: "var(--color-text-tertiary)",
              border: "1px solid var(--color-border-tertiary)",
            }}>
              {alert.status === "closed"
                ? "Alert is closed — no investigation needed."
                : "Investigation not available for this severity level."}
            </div>
          )}
        </div>

        {/* ── Investigation result ─────────────────────────────────────────── */}
        {investigation && (
          <>
            <div style={{ padding: "14px 16px 0" }}>
              <SectionTitle>Investigation result</SectionTitle>
              <InvestigationSummary investigation={investigation} />
            </div>
            <div style={{ padding: "12px 0 0" }}><Divider /></div>
          </>
        )}

        {/* ── Trade snapshot ───────────────────────────────────────────────── */}
        <div style={{ padding: "14px 16px 0" }}>
          <SectionTitle>Trade snapshot</SectionTitle>
          <TradeSnapshot trade={trade} alert={alert} />
        </div>
        <div style={{ padding: "12px 0 0" }}><Divider /></div>

        {/* ── ML signal ───────────────────────────────────────────────────── */}
        <div style={{ padding: "14px 16px 0" }}>
          <SectionTitle>ML signal · SHAP explanation</SectionTitle>
          {alert.top_3ShapFeatures && alert.top_3ShapFeatures.length > 0 ? (
            <ShapFeatureBar
              features={alert.top_3ShapFeatures}
              anomalyScore={alert.anomalyScore}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
              {alert.anomalyScore != null && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "var(--color-text-secondary)" }}>Anomaly score</span>
                  <span className="mono" style={{ fontWeight: 600, fontSize: 13 }}>
                    {alert.anomalyScore.toFixed(4)}
                  </span>
                </div>
              )}
              {alert.topShapFeature && (
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ color: "var(--color-text-secondary)" }}>Top SHAP feature</span>
                  <span className="mono" style={{ fontSize: 11 }}>{alert.topShapFeature}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Assignee ─────────────────────────────────────────────────────── */}
        <div style={{ padding: "10px 16px 0", fontSize: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--color-text-secondary)" }}>Assignee</span>
            <span style={{ fontWeight: 500 }}>{alert.assignee ?? "Unassigned"}</span>
          </div>
        </div>
        <div style={{ padding: "12px 0 0" }}><Divider /></div>

        {/* ── Notes ───────────────────────────────────────────────────────── */}
        <div style={{ padding: "14px 16px 4px" }}>
          <SectionTitle>Notes · {notes.length}</SectionTitle>
          <NotesTimeline notes={notes} />
        </div>
        <Divider />

        {/* ── Actions ─────────────────────────────────────────────────────── */}
        <AlertActionsForm onSubmit={onSubmitAction} appRole={appRole} />
      </div>
    </div>
  );
}
