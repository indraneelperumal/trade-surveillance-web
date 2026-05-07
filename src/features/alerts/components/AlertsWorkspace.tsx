"use client";

import { Button } from "@/components/ui/Button";
import { Panel, PanelHead } from "@/components/ui/Panel";
import { listAlerts, patchAlert } from "@/lib/api/endpoints/alerts";
import { getInvestigation, listInvestigations } from "@/lib/api/endpoints/investigations";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type AlertsWorkspaceProps = {
  initialStatus: string;
  initialSeverity: string;
  initialOffset: number;
  initialLimit: number;
  initialSelected?: string;
};

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

  const status = searchParams.get("status") ?? initialStatus;
  const severity = searchParams.get("severity") ?? initialSeverity;
  const offset = Number(searchParams.get("offset") ?? initialOffset);
  const limit = Number(searchParams.get("limit") ?? initialLimit);
  const selected = searchParams.get("selected") ?? initialSelected;

  const alertsQuery = useQuery({
    queryKey: queryKeys.alerts.list({ status, severity, offset, limit }),
    queryFn: () =>
      listAlerts({
        status: status === "all" ? undefined : status,
        severity: severity === "all" ? undefined : severity,
        offset,
        limit,
      }),
  });

  const alerts = alertsQuery.data?.items ?? [];
  const selectedAlert = alerts.find((item) => item.id === selected) ?? alerts[0];

  const notesQuery = useQuery({
    queryKey: queryKeys.notes.list({ alertId: selectedAlert?.id ?? "none" }),
    queryFn: () =>
      selectedAlert
        ? listNotes({ alert_id: selectedAlert.id, offset: 0, limit: 50 })
        : Promise.resolve({ items: [], total: 0, offset: 0, limit: 50 }),
    enabled: Boolean(selectedAlert),
  });

  const investigationsQuery = useQuery({
    queryKey: queryKeys.investigations.list({ alertId: selectedAlert?.id ?? "none" }),
    queryFn: () =>
      selectedAlert
        ? listInvestigations({ alert_id: selectedAlert.id, offset: 0, limit: 1 })
        : Promise.resolve({ items: [], total: 0, offset: 0, limit: 1 }),
    enabled: Boolean(selectedAlert),
  });

  const latestInvestigation = investigationsQuery.data?.items[0];

  const investigationDetailQuery = useQuery({
    queryKey: queryKeys.investigations.detail(latestInvestigation?.id ?? "none"),
    queryFn: () =>
      latestInvestigation ? getInvestigation(latestInvestigation.id) : Promise.resolve(null),
    enabled: Boolean(latestInvestigation),
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

  const updateUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const mutation = useMutation({
    mutationFn: async ({ alertId, values }: { alertId: string; values: AlertActionValues }) => {
      await patchAlert(alertId, {
        status: values.status,
        assignee: values.assignee || null,
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
          <PanelHead
            title="Alert queue"
            right={<Button className="px-2.5 py-1 text-[11px]">Export</Button>}
          />
          <AlertFilters
            status={status}
            severity={severity}
            onStatusChange={(next) => updateUrl({ status: next, offset: "0" })}
            onSeverityChange={(next) => updateUrl({ severity: next, offset: "0" })}
          />
          {alertsQuery.isPending ? (
            <div className="p-6 text-[12px] text-[var(--color-text-secondary)]">
              Loading alerts...
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-6 text-[12px] text-[var(--color-text-secondary)]">
              No alerts match the selected filters.
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
              Showing {Math.min(offset + 1, total)}-{Math.min(offset + limit, total)} of {total}
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
            title={selectedAlert ? `${selectedAlert.id} · ${selectedAlert.symbol}` : "Select an alert"}
          />
          <div className="flex-1 overflow-y-auto">
            <AlertDetailPanel
              alert={selectedAlert}
              trade={tradeQuery.data}
              investigation={investigationDetailQuery.data}
              notes={notesQuery.data?.items ?? []}
              onSubmitAction={(values) => {
                if (!selectedAlert) return;
                mutation.mutate({ alertId: selectedAlert.id, values });
              }}
            />
            {(notesQuery.isError || investigationsQuery.isError || tradeQuery.isError) && (
              <div className="px-4 py-2 text-[11px] text-[#A32D2D]">
                Some detail sections failed to load.
              </div>
            )}
            {mutation.isError && (
              <div className="px-4 py-2 text-[11px] text-[#A32D2D]">
                Failed to save alert updates.
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
