"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { listAlerts, patchAlert } from "@/lib/api/endpoints/alerts";
import {
  getInvestigation,
  listInvestigations,
  triggerInvestigation,
} from "@/lib/api/endpoints/investigations";
import { createNote, listNotes } from "@/lib/api/endpoints/notes";
import { getTrade } from "@/lib/api/endpoints/trades";
import { listModelRuns } from "@/lib/api/endpoints/modelRuns";
import { queryKeys } from "@/lib/api/queryKeys";
import { AlertDetailPanel } from "@/features/alerts/components/AlertDetailPanel";
import { AlertFilters } from "@/features/alerts/components/AlertFilters";
import { AlertQueueTable } from "@/features/alerts/components/AlertQueueTable";
import { AlertActionValues } from "@/features/alerts/components/AlertActionsForm";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type AlertsWorkspaceProps = {
  initialStatus: string;
  initialSeverity: string;
  initialOffset: number;
  initialLimit: number;
  initialSelected?: string;
};

const TABS = [
  { id: "all",  label: "All alerts"    },
  { id: "high", label: "High priority" },
] as const;
type Tab = (typeof TABS)[number]["id"];

// ── Simple KPI card ────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "red" | "amber" | "blue";
}) {
  const accentColor = accent === "red" ? "var(--sev-high-text)"
    : accent === "amber" ? "var(--sev-med-text)"
    : accent === "blue"  ? "var(--color-accent-default)"
    : "var(--color-text-primary)";
  return (
    <div style={{
      flex: 1,
      padding: "12px 16px",
      borderRadius: 8,
      background: "var(--color-background-primary)",
      border: "1px solid var(--color-border-tertiary)",
      minWidth: 0,
    }}>
      <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: accentColor, lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}

export function AlertsWorkspace({
  initialStatus,
  initialSeverity,
  initialOffset,
  initialLimit,
  initialSelected,
}: AlertsWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { appRole } = useAuth();

  const tab = (searchParams.get("tab") as Tab) ?? "all";
  const status = searchParams.get("status") ?? initialStatus;
  const severity = searchParams.get("severity") ?? initialSeverity;
  const offset = Number(searchParams.get("offset") ?? initialOffset);
  const limit = Number(searchParams.get("limit") ?? initialLimit);
  const selected = searchParams.get("selected") ?? initialSelected;

  const [pendingAlertId, setPendingAlertId] = useState<string | null>(null);

  const updateUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const queryStatus   = tab === "high" ? "open"  : status   === "all" ? undefined : status;
  const querySeverity = tab === "high" ? "high"   : severity === "all" ? undefined : severity;

  const alertsQuery = useQuery({
    queryKey: queryKeys.alerts.list({ tab, status: queryStatus ?? "all", severity: querySeverity ?? "all", offset, limit }),
    queryFn: () => listAlerts({ status: queryStatus, severity: querySeverity, offset, limit }),
  });

  const alerts = alertsQuery.data?.items ?? [];
  const total  = alertsQuery.data?.total ?? 0;
  const selectedAlert = alerts.find((item) => item.id === selected) ?? null;

  useEffect(() => {
    if (pendingAlertId && selectedAlert?.id !== pendingAlertId) setPendingAlertId(null);
  }, [selectedAlert?.id, pendingAlertId]);

  const isRunning = pendingAlertId === selectedAlert?.id || selectedAlert?.status === "in-progress";

  const investigationsQuery = useQuery({
    queryKey: queryKeys.investigations.list({ alertId: selectedAlert?.id ?? "none" }),
    queryFn: () => selectedAlert
      ? listInvestigations({ alert_id: selectedAlert.id, offset: 0, limit: 1 })
      : Promise.resolve({ items: [], total: 0, offset: 0, limit: 1 }),
    enabled: Boolean(selectedAlert),
    refetchInterval: (pendingAlertId === selectedAlert?.id || selectedAlert?.status === "in-progress") ? 3000 : false,
  });

  const latestInvestigation = investigationsQuery.data?.items[0];

  useEffect(() => {
    if (latestInvestigation && pendingAlertId === selectedAlert?.id) {
      setPendingAlertId(null);
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    }
  }, [latestInvestigation?.id, pendingAlertId, selectedAlert?.id, queryClient]);

  const investigationDetailQuery = useQuery({
    queryKey: queryKeys.investigations.detail(latestInvestigation?.id ?? "none"),
    queryFn: () => latestInvestigation ? getInvestigation(latestInvestigation.id) : Promise.resolve(null),
    enabled: Boolean(latestInvestigation),
  });

  const notesQuery = useQuery({
    queryKey: queryKeys.notes.list({ alertId: selectedAlert?.id ?? "none" }),
    queryFn: () => selectedAlert
      ? listNotes({ alert_id: selectedAlert.id, offset: 0, limit: 50 })
      : Promise.resolve({ items: [], total: 0, offset: 0, limit: 50 }),
    enabled: Boolean(selectedAlert),
  });

  const tradeQuery = useQuery({
    queryKey: ["trade", selectedAlert?.tradeId ?? "none"],
    queryFn: () => selectedAlert?.tradeId ? getTrade(selectedAlert.tradeId) : Promise.resolve(null),
    enabled: Boolean(selectedAlert?.tradeId),
  });

  const modelRunsQuery = useQuery({
    queryKey: queryKeys.modelRuns.list({ offset: 0, limit: 1 }),
    queryFn: () => listModelRuns({ offset: 0, limit: 1 }),
  });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const actionMutation = useMutation({
    mutationFn: async ({ alertId, values }: { alertId: string; values: AlertActionValues }) => {
      await patchAlert(alertId, {
        status: values.status,
        assignee: values.assignee || null,
        ...(values.disposition ? { disposition: values.disposition } : {}),
      });
      await createNote({ alert_id: alertId, content: values.note, note_type: "human" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const triggerMutation = useMutation({
    mutationFn: (alertId: string) => triggerInvestigation(alertId),
    onSuccess: (_, alertId) => {
      setPendingAlertId(alertId);
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  // ── KPI metrics ────────────────────────────────────────────────────────────
  const openCount       = alerts.filter((a) => a.status === "open").length;
  const inProgressCount = alerts.filter((a) => a.status === "in-progress").length;
  const highCount       = alerts.filter((a) => a.severity === "high").length;
  const precision       = modelRunsQuery.data?.items[0]?.precision;

  const detailOpen = Boolean(selectedAlert);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {alertsQuery.isError && (
        <div style={{
          padding: "8px 14px", borderRadius: 8, fontSize: 12,
          background: "var(--sev-high-bg)", color: "var(--sev-high-text)",
          border: "1px solid var(--sev-high-bar)",
        }}>
          Failed to load alerts. Check backend health and NEXT_PUBLIC_API_BASE_URL.
        </div>
      )}

      {/* ── KPI row ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12 }}>
        <KpiCard label="Total loaded"  value={total.toLocaleString()} />
        <KpiCard label="Open"          value={openCount}       accent="blue" />
        <KpiCard label="In progress"   value={inProgressCount} accent="amber" />
        <KpiCard label="High severity" value={highCount}       accent="red" />
        {precision != null && (
          <KpiCard label="Model precision" value={`${(precision * 100).toFixed(1)}%`} />
        )}
      </div>

      {/* ── Main panel ───────────────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        gap: 0,
        flex: 1,
        minHeight: 0,
        borderRadius: 10,
        border: "1px solid var(--color-border-tertiary)",
        background: "var(--color-background-primary)",
        overflow: "hidden",
      }}>

        {/* ── Left: queue ──────────────────────────────────────────────── */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
          borderRight: detailOpen ? "1px solid var(--color-border-tertiary)" : "none",
        }}>
          {/* Tab bar + filters */}
          <div style={{
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid var(--color-border-tertiary)",
            padding: "0 16px",
            flexShrink: 0,
          }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => updateUrl({ tab: t.id, offset: "0" })}
                style={{
                  position: "relative",
                  padding: "10px 14px 10px 0",
                  marginRight: 4,
                  fontSize: 12,
                  fontWeight: tab === t.id ? 600 : 400,
                  color: tab === t.id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {t.label}
                {t.id === "high" && highCount > 0 && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 10,
                    background: "var(--sev-high-bg)", color: "var(--sev-high-text)",
                  }}>
                    {highCount}
                  </span>
                )}
                {tab === t.id && (
                  <span style={{
                    position: "absolute", bottom: 0, left: 0, right: 14,
                    height: 2, background: "var(--color-accent-default)", borderRadius: "2px 2px 0 0",
                  }} />
                )}
              </button>
            ))}
            {tab === "all" && (
              <div style={{ marginLeft: "auto" }}>
                <AlertFilters
                  status={status}
                  severity={severity}
                  onStatusChange={(next) => updateUrl({ status: next, offset: "0" })}
                  onSeverityChange={(next) => updateUrl({ severity: next, offset: "0" })}
                />
              </div>
            )}
          </div>

          {/* Table */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {alertsQuery.isPending ? (
              <div style={{ padding: 24, color: "var(--color-text-tertiary)", fontSize: 13 }}>
                Loading alerts…
              </div>
            ) : alerts.length === 0 ? (
              <div style={{ padding: 24, color: "var(--color-text-tertiary)", fontSize: 13 }}>
                {tab === "high" ? "No open HIGH severity alerts." : "No alerts match the selected filters."}
              </div>
            ) : (
              <AlertQueueTable
                alerts={alerts}
                selectedAlertId={selectedAlert?.id}
                onSelect={(alertId) => updateUrl({ selected: alertId })}
              />
            )}
          </div>

          {/* Pagination */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 16px",
            borderTop: "1px solid var(--color-border-tertiary)",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
              {total === 0 ? "No results" : `${Math.min(offset + 1, total)}–${Math.min(offset + limit, total)} of ${total.toLocaleString()}`}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                className="btn"
                disabled={offset === 0}
                onClick={() => updateUrl({ offset: String(Math.max(offset - limit, 0)) })}
              >
                Prev
              </button>
              <button
                className="btn"
                disabled={offset + limit >= total}
                onClick={() => updateUrl({ offset: String(offset + limit) })}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: detail panel ──────────────────────────────────────── */}
        {detailOpen && (
          <div
            className="drawer-enter"
            style={{ width: 420, flexShrink: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}
          >
            <AlertDetailPanel
              alert={selectedAlert ?? undefined}
              trade={tradeQuery.data}
              investigation={investigationDetailQuery.data}
              notes={notesQuery.data?.items ?? []}
              isRunning={isRunning}
              appRole={appRole}
              onClose={() => updateUrl({ selected: "" })}
              onRunInvestigation={() => {
                if (selectedAlert) triggerMutation.mutate(selectedAlert.id);
              }}
              onSubmitAction={(values) => {
                if (!selectedAlert) return;
                actionMutation.mutate({ alertId: selectedAlert.id, values });
              }}
            />
            {/* Error banners */}
            {actionMutation.isError && (
              <div style={{ padding: "8px 16px", fontSize: 11, color: "var(--sev-high-text)" }}>
                {actionMutation.error instanceof ApiError && actionMutation.error.status === 403
                  ? "You are not authorised to perform this action. Contact your Compliance Lead."
                  : actionMutation.error instanceof ApiError && actionMutation.error.status === 422
                    ? (actionMutation.error.message ?? "Invalid action — check required fields.")
                    : "Failed to save alert updates."}
              </div>
            )}
            {triggerMutation.isError && (
              <div style={{ padding: "8px 16px", fontSize: 11, color: "var(--sev-high-text)" }}>
                Failed to trigger investigation. Check alert status or API key.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
