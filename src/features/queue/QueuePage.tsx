"use client";

import { useAuth } from "@/contexts/AuthContext";
import { listAlerts } from "@/lib/api/endpoints/alerts";
import { AlertQueueTable } from "@/features/alerts/components/AlertQueueTable";
import {
  filterAlertsClient,
  QueueSearchToolbar,
  symbolFromSearch,
  type QueueFilterState,
} from "@/features/alerts/components/QueueSearchToolbar";
import { queryKeys } from "@/lib/api/queryKeys";
import { caseDetailHref } from "@/lib/navigation/caseReturn";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

const VIEWS: Record<string, { label: string; params: Record<string, string | boolean> }> = {
  open: { label: "Open work", params: { status: "open" } },
  in_progress: { label: "In progress", params: { status: "in-progress" } },
  mine: { label: "My cases", params: { assignedTo: "me" } },
  unassigned: { label: "Unassigned high", params: { severity: "high", unassigned: true } },
  officer: { label: "Pending officer", params: { status: "pending_officer_review" } },
  stale: { label: "Stale >24h", params: { stale: true } },
};

export function QueuePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasAccessToken, isLoading: authLoading } = useAuth();

  const viewParam = searchParams.get("view") ?? "open";
  const view = viewParam === "all" ? "open" : viewParam;
  const offset = Number(searchParams.get("offset") ?? 0);
  const limit = 20;
  const preset = VIEWS[view] ?? VIEWS.open;

  const filters: QueueFilterState = {
    q: searchParams.get("q") ?? "",
    severity: searchParams.get("severity") ?? "all",
    status: searchParams.get("status") ?? "all",
    anomalyType: searchParams.get("anomalyType") ?? "all",
  };

  const symbol =
    searchParams.get("symbol") ?? symbolFromSearch(filters.q) ?? undefined;

  const patchFilters = (patch: Partial<QueueFilterState>) => {
    const params = new URLSearchParams(searchParams.toString());
    const next = { ...filters, ...patch };
    if (next.q) params.set("q", next.q);
    else params.delete("q");
    if (next.severity !== "all") params.set("severity", next.severity);
    else params.delete("severity");
    if (next.status !== "all") params.set("status", next.status);
    else params.delete("status");
    if (next.anomalyType !== "all") params.set("anomalyType", next.anomalyType);
    else params.delete("anomalyType");
    const sym = symbolFromSearch(next.q);
    if (sym) params.set("symbol", sym);
    else params.delete("symbol");
    params.set("offset", "0");
    router.push(`/queue?${params.toString()}`);
  };

  const setView = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", next);
    params.set("offset", "0");
    if (VIEWS[next]?.params.status) params.delete("status");
    router.push(`/queue?${params.toString()}`);
  };

  const viewLocksStatus = Boolean(preset.params.status);

  const queryStatus = viewLocksStatus
    ? typeof preset.params.status === "string"
      ? preset.params.status
      : undefined
    : filters.status !== "all"
      ? filters.status
      : undefined;

  const querySeverity =
    filters.severity !== "all"
      ? filters.severity
      : typeof preset.params.severity === "string"
        ? preset.params.severity
        : undefined;

  const query = useQuery({
    queryKey: queryKeys.alerts.list({
      view,
      offset,
      limit,
      symbol: symbol ?? "",
      q: filters.q,
      severity: querySeverity ?? "all",
      status: queryStatus ?? "all",
      anomalyType: filters.anomalyType,
      ...preset.params,
    }),
    queryFn: () =>
      listAlerts({
        offset,
        limit,
        symbol,
        status: queryStatus,
        severity: querySeverity,
        anomalyType: filters.anomalyType !== "all" ? filters.anomalyType : undefined,
        assignedTo: typeof preset.params.assignedTo === "string" ? preset.params.assignedTo : undefined,
        unassigned: preset.params.unassigned === true,
        stale: preset.params.stale === true,
        excludeClosed: preset.params.excludeClosed === true,
      } as Parameters<typeof listAlerts>[0]),
    enabled: !authLoading && hasAccessToken,
  });

  const items = useMemo(
    () => filterAlertsClient(query.data?.items ?? [], filters.q),
    [query.data?.items, filters.q],
  );
  const total = query.data?.total ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {Object.entries(VIEWS).map(([key, v]) => (
          <button
            key={key}
            type="button"
            onClick={() => setView(key)}
            className={`rounded px-3 py-1.5 text-[12px] font-medium ${
              view === key
                ? "bg-[var(--color-accent-default)] text-white"
                : "border border-[var(--chip-border)] bg-[var(--chip-bg)] text-[var(--chip-text)] hover:bg-[var(--chip-hover-bg)]"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <QueueSearchToolbar
        filters={filters}
        onChange={patchFilters}
        hideStatus={viewLocksStatus}
      />

      <p className="text-[12px] text-[var(--color-text-secondary)]">
        {total.toLocaleString()} matching cases
        {filters.q ? ` · showing ${items.length} on this page after search` : ""}
      </p>

      {query.isPending ? (
        <div className="p-6 text-[13px]">Loading queue…</div>
      ) : (
        <>
          <AlertQueueTable
            alerts={items}
            onSelect={(id) => {
              router.push(caseDetailHref(id, "queue", searchParams));
            }}
          />
          <div className="flex justify-between text-[12px]">
            <button
              type="button"
              className="btn"
              disabled={offset === 0}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("offset", String(Math.max(0, offset - limit)));
                router.push(`/queue?${params.toString()}`);
              }}
            >
              Prev
            </button>
            <span className="self-center text-[var(--color-text-tertiary)]">
              {offset + 1}–{Math.min(offset + limit, total)} of {total}
            </span>
            <button
              type="button"
              className="btn"
              disabled={offset + limit >= total}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("offset", String(offset + limit));
                router.push(`/queue?${params.toString()}`);
              }}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
