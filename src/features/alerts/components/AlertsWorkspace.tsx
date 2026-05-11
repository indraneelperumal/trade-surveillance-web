"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Panel, PanelHead } from "@/components/ui/Panel";
import { ApiError } from "@/lib/api/client";
import { listAlerts, patchAlert } from "@/lib/api/endpoints/alerts";
import {
  getInvestigation,
  listInvestigations,
  triggerInvestigation,
} from "@/lib/api/endpoints/investigations";
import { createNote, listNotes } from "@/lib/api/endpoints/notes";
import { getTrade } from "@/lib/api/endpoints/trades";
import { listUsers } from "@/lib/api/endpoints/users";
import { listModelRuns } from "@/lib/api/endpoints/modelRuns";
import { queryKeys } from "@/lib/api/queryKeys";
import { AlertDetailPanel } from "@/features/alerts/components/AlertDetailPanel";
import { AlertFilters } from "@/features/alerts/components/AlertFilters";
import { AlertMetricRow } from "@/features/alerts/components/AlertMetricRow";
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
  { id: "all", label: "All alerts" },
  { id: "high", label: "High priority" },
] as const;

type Tab = (typeof TABS)[number]["id"];

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

  // Track which alert_id has a pending investigation trigger
  const [pendingAlertId, setPendingAlertId] = useState<string | null>(null);

  const updateUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // For the "High priority" tab, force HIGH severity + OPEN status
  const queryStatus = tab === "high" ? "open" : status === "all" ? undefined : status;
  const querySeverity = tab === "high" ? "high" : severity === "all" ? undefined : severity;

  const alertsQuery = useQuery({
    queryKey: queryKeys.alerts.list({
      tab,
      status: queryStatus ?? "all",
      severity: querySeverity ?? "all",
      offset,
      limit,
    }),
    queryFn: () =>
      listAlerts({
        status: queryStatus,
        severity: querySeverity,
        offset,
        limit,
      }),
  });

  const alerts = alertsQuery.data?.items ?? [];
  const selectedAlert = alerts.find((item) => item.id === selected) ?? alerts[0];

  // Clear pending state when switching alerts
  useEffect(() => {
    if (pendingAlertId && selectedAlert?.id !== pendingAlertId) {
      setPendingAlertId(null);
    }
  }, [selectedAlert?.id, pendingAlertId]);

  const isRunning =
    pendingAlertId === selectedAlert?.id ||
    selectedAlert?.status === "in-progress";

  const investigationsQuery = useQuery({
    queryKey: queryKeys.investigations.list({ alertId: selectedAlert?.id ?? "none" }),
    queryFn: () =>
      selectedAlert
        ? listInvestigations({ alert_id: selectedAlert.id, offset: 0, limit: 1 })
        : Promise.resolve({ items: [], total: 0, offset: 0, limit: 1 }),
    enabled: Boolean(selectedAlert),
    // Poll every 3 s while we're waiting for the agent to finish
    refetchInterval:
      pendingAlertId === selectedAlert?.id || selectedAlert?.status === "in-progress"
        ? 3000
        : false,
  });

  const latestInvestigation = investigationsQuery.data?.items[0];

  // When investigation arrives, clear the pending state + refresh alert status
  useEffect(() => {
    if (latestInvestigation && pendingAlertId === selectedAlert?.id) {
      setPendingAlertId(null);
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    }
  }, [latestInvestigation?.id, pendingAlertId, selectedAlert?.id, queryClient]);

  const investigationDetailQuery = useQuery({
    queryKey: queryKeys.investigations.detail(latestInvestigation?.id ?? "none"),
    queryFn: () =>
      latestInvestigation ? getInvestigation(latestInvestigation.id) : Promise.resolve(null),
    enabled: Boolean(latestInvestigation),
  });

  const notesQuery = useQuery({
    queryKey: queryKeys.notes.list({ alertId: selectedAlert?.id ?? "none" }),
    queryFn: () =>
      selectedAlert
        ? listNotes({ alert_id: selectedAlert.id, offset: 0, limit: 50 })
        : Promise.resolve({ items: [], total: 0, offset: 0, limit: 50 }),
    enabled: Boolean(selectedAlert),
  });

  const tradeQuery = useQuery({
    queryKey: ["trade", selectedAlert?.tradeId ?? "none"],
    queryFn: () =>
      selectedAlert?.tradeId ? getTrade(selectedAlert.tradeId) : Promise.resolve(null),
    enabled: Boolean(selectedAlert?.tradeId),
  });

  const usersQuery = useQuery({
    queryKey: queryKeys.users.list({ offset: 0, limit: 50 }),
    queryFn: () => listUsers({ offset: 0, limit: 50 }),
  });

  const modelRunsQuery = useQuery({
    queryKey: queryKeys.modelRuns.list({ offset: 0, limit: 1 }),
    queryFn: () => listModelRuns({ offset: 0, limit: 1 }),
  });

  // ── Mutations ────────────────────────────────────────────────────────────────

  const actionMutation = useMutation({
    mutationFn: async ({ alertId, values }: { alertId: string; values: AlertActionValues }) => {
      await patchAlert(alertId, {
        status: values.status,
        assignee: values.assignee || null,
        ...(values.disposition ? { disposition: values.disposition } : {}),
      });
      await createNote({
        alert_id: alertId,
        content: values.note,
        note_type: "human",
      });
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
      // Refresh alerts so the status badge reflects IN_PROGRESS
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  // ── Metrics ──────────────────────────────────────────────────────────────────

  const total = alertsQuery.data?.total ?? 0;
  const openCount = alerts.filter((item) => item.status === "open").length;
  const inProgressCount = alerts.filter((item) => item.status === "in-progress").length;
  const highCount = alerts.filter((item) => item.severity === "high").length;
  const closedDurationsHours = alerts
    .filter((item) => item.status === "closed")
    .map((item) => {
      const created = Date.parse(item.createdAt);
      const updated = Date.parse(item.updatedAt);
      if (Number.isNaN(created) || Number.isNaN(updated) || updated < created) return null;
      return (updated - created) / (1000 * 60 * 60);
    })
    .filter((value): value is number => value !== null);
  const avgResolutionHours =
    closedDurationsHours.length > 0
      ? closedDurationsHours.reduce((sum, hours) => sum + hours, 0) / closedDurationsHours.length
      : null;
  const latestModelPrecision = modelRunsQuery.data?.items[0]?.precision ?? null;

  return (
    <div className="flex flex-col gap-4">
      {alertsQuery.isError ? (
        <div className="rounded-[10px] border border-[#F4C7C7] bg-[#FCEBEB] px-3 py-2 text-[12px] text-[#A32D2D]">
          Failed to load alerts. Verify `NEXT_PUBLIC_API_BASE_URL` and backend health.
        </div>
      ) : null}

      <AlertMetricRow
        total={total}
        openCount={openCount}
        inProgressCount={inProgressCount}
        highCount={highCount}
        avgResolutionHours={avgResolutionHours}
        modelPrecision={latestModelPrecision}
      />

      <div className="grid grid-cols-[1fr_300px] gap-4">
        <Panel>
          {/* Tab bar */}
          <div className="flex items-center border-b border-[var(--color-border-tertiary)] px-4">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => updateUrl({ tab: t.id, offset: "0" })}
                className={cn(
                  "relative -mb-px py-2.5 pr-5 text-[12px] font-medium transition-colors",
                  tab === t.id
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
                )}
              >
                {t.label}
                {t.id === "high" && (
                  <span
                    className={cn(
                      "ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold",
                      tab === "high"
                        ? "bg-[#FDECEC] text-[#A32D2D]"
                        : "bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)]",
                    )}
                  >
                    {highCount}
                  </span>
                )}
                {tab === t.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-accent-default)]" />
                )}
              </button>
            ))}
            <div className="ml-auto">
              <Button className="px-2.5 py-1 text-[11px]">Export</Button>
            </div>
          </div>

          {/* Filters — only in "all" tab */}
          {tab === "all" && (
            <AlertFilters
              status={status}
              severity={severity}
              onStatusChange={(next) => updateUrl({ status: next, offset: "0" })}
              onSeverityChange={(next) => updateUrl({ severity: next, offset: "0" })}
            />
          )}

          {alertsQuery.isPending ? (
            <div className="p-6 text-[12px] text-[var(--color-text-secondary)]">
              Loading alerts…
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-6 text-[12px] text-[var(--color-text-secondary)]">
              {tab === "high"
                ? "No open HIGH severity alerts."
                : "No alerts match the selected filters."}
            </div>
          ) : (
            <AlertQueueTable
              alerts={alerts}
              selectedAlertId={selectedAlert?.id}
              onSelect={(alertId) => updateUrl({ selected: alertId })}
            />
          )}

          <div className="flex items-center justify-between border-t border-[var(--color-border-tertiary)] px-4 py-2.5">
            <span className="text-[11px] text-[var(--color-text-secondary)]">
              Showing {Math.min(offset + 1, total)}–{Math.min(offset + limit, total)} of {total}
            </span>
            <div className="flex gap-1.5">
              <Button
                className="px-2.5 py-1 text-[11px]"
                disabled={offset === 0}
                onClick={() =>
                  updateUrl({ offset: String(Math.max(offset - limit, 0)), limit: String(limit) })
                }
              >
                Prev
              </Button>
              <Button
                className="px-2.5 py-1 text-[11px]"
                disabled={offset + limit >= total}
                onClick={() => updateUrl({ offset: String(offset + limit), limit: String(limit) })}
              >
                Next
              </Button>
            </div>
          </div>
        </Panel>

        <Panel className="flex min-h-[600px] flex-col">
          <PanelHead
            title={selectedAlert ? `${selectedAlert.id.slice(0, 8)}… · ${selectedAlert.symbol}` : "Select an alert"}
          />
          <div className="flex-1 overflow-y-auto">
            <AlertDetailPanel
              alert={selectedAlert}
              trade={tradeQuery.data}
              investigation={investigationDetailQuery.data}
              notes={notesQuery.data?.items ?? []}
              isRunning={isRunning}
              appRole={appRole}
              onRunInvestigation={() => {
                if (selectedAlert) triggerMutation.mutate(selectedAlert.id);
              }}
              onSubmitAction={(values) => {
                if (!selectedAlert) return;
                actionMutation.mutate({ alertId: selectedAlert.id, values });
              }}
            />
            {(notesQuery.isError || investigationsQuery.isError || tradeQuery.isError) && (
              <div className="px-4 py-2 text-[11px] text-[#A32D2D]">
                Some detail sections failed to load.
              </div>
            )}
            {actionMutation.isError && (
              <div className="px-4 py-2 text-[11px] text-[#A32D2D]">
                {actionMutation.error instanceof ApiError &&
                actionMutation.error.status === 403
                  ? "You are not authorised to perform this action. Contact your Compliance Lead."
                  : actionMutation.error instanceof ApiError &&
                      actionMutation.error.status === 422
                    ? (actionMutation.error.message ?? "Invalid action. Check all required fields.")
                    : "Failed to save alert updates."}
              </div>
            )}
            {triggerMutation.isError && (
              <div className="px-4 py-2 text-[11px] text-[#A32D2D]">
                Failed to trigger investigation. Check the alert status or API key.
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
