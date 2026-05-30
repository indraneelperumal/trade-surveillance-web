"use client";

import { listAlerts } from "@/lib/api/endpoints/alerts";
import { filterAlertsClient } from "@/features/alerts/components/QueueSearchToolbar";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

const VIEWS: Record<string, Record<string, string | boolean>> = {
  open: { status: "open" },
  in_progress: { status: "in-progress" },
  mine: { assignedTo: "me" },
  unassigned: { severity: "high", unassigned: true },
  officer: { status: "pending_officer_review" },
  stale: { stale: true },
};

type CaseNavigatorProps = {
  alertId: string;
  /** URL search string from queue context (without leading ?) */
  queueContext: string;
};

export function CaseNavigator({ alertId, queueContext }: CaseNavigatorProps) {
  const { hasAccessToken, isLoading: authLoading } = useAuth();
  const params = new URLSearchParams(queueContext);

  const view = params.get("view") ?? "open";
  const severity = params.get("severity") ?? "all";
  const status = params.get("status") ?? "all";
  const anomalyType = params.get("anomalyType") ?? "all";
  const q = params.get("q") ?? "";
  const symbolParam = params.get("symbol") ?? undefined;
  const offset = Number(params.get("offset") ?? 0);
  const preset = VIEWS[view] ?? VIEWS.open;
  const viewLocksStatus = Boolean(preset.status);

  const listQuery = useQuery({
    queryKey: ["case-nav", view, severity, status, anomalyType, symbolParam, q, offset],
    queryFn: () => {
      const queryStatus = viewLocksStatus
        ? typeof preset.status === "string"
          ? preset.status
          : undefined
        : status !== "all"
          ? status
          : undefined;
      const querySeverity =
        severity !== "all"
          ? severity
          : typeof preset.severity === "string"
            ? preset.severity
            : undefined;

      return listAlerts({
        offset,
        limit: 20,
        symbol: symbolParam,
        severity: querySeverity,
        status: queryStatus,
        anomalyType: anomalyType !== "all" ? anomalyType : undefined,
        assignedTo: typeof preset.assignedTo === "string" ? preset.assignedTo : undefined,
        unassigned: preset.unassigned === true,
        stale: preset.stale === true,
      });
    },
    enabled: !authLoading && hasAccessToken,
  });

  const items = useMemo(
    () => filterAlertsClient(listQuery.data?.items ?? [], q),
    [listQuery.data?.items, q],
  );
  const idx = items.findIndex((a) => a.id === alertId);
  const prev = idx > 0 ? items[idx - 1] : null;
  const next = idx >= 0 && idx < items.length - 1 ? items[idx + 1] : null;
  const ctx = queueContext ? `?${queueContext}` : "";

  if (listQuery.isPending || idx < 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-3 py-2 text-[11px]">
      {prev ? (
        <Link
          href={`/cases/${prev.id}${ctx}`}
          className="flex items-center gap-1 text-[var(--color-accent-default)] hover:underline"
        >
          <ChevronLeft size={14} />
          {prev.symbol}
        </Link>
      ) : (
        <span className="text-[var(--color-text-tertiary)]">Start of page</span>
      )}
      <span className="font-medium text-[var(--color-text-secondary)]">
        {items[idx]?.symbol} · {idx + 1} of {items.length} on this page
        {q ? ` · “${q}”` : ""}
      </span>
      {next ? (
        <Link
          href={`/cases/${next.id}${ctx}`}
          className="flex items-center gap-1 text-[var(--color-accent-default)] hover:underline"
        >
          {next.symbol}
          <ChevronRight size={14} />
        </Link>
      ) : (
        <span className="text-[var(--color-text-tertiary)]">End of page</span>
      )}
    </div>
  );
}
