"use client";

import { useAuth } from "@/contexts/AuthContext";
import { listAlerts } from "@/lib/api/endpoints/alerts";
import { AlertQueueTable } from "@/features/alerts/components/AlertQueueTable";
import { queryKeys } from "@/lib/api/queryKeys";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const VIEWS: Record<string, { label: string; params: Record<string, string | boolean> }> = {
  all: { label: "All open work", params: { excludeClosed: true } },
  mine: { label: "My cases", params: { assignedTo: "me" } },
  unassigned: { label: "Unassigned high", params: { severity: "high", unassigned: true } },
  officer: { label: "Pending officer", params: { status: "pending_officer_review" } },
  stale: { label: "Stale >24h", params: { stale: true } },
};

export function QueuePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasAccessToken, isLoading: authLoading } = useAuth();

  const view = searchParams.get("view") ?? "all";
  const offset = Number(searchParams.get("offset") ?? 0);
  const limit = 20;
  const preset = VIEWS[view] ?? VIEWS.all;

  const query = useQuery({
    queryKey: queryKeys.alerts.list({ view, offset, limit, ...preset.params }),
    queryFn: () =>
      listAlerts({
        offset,
        limit,
        status: typeof preset.params.status === "string" ? preset.params.status : undefined,
        severity: typeof preset.params.severity === "string" ? preset.params.severity : undefined,
        assignedTo: typeof preset.params.assignedTo === "string" ? preset.params.assignedTo : undefined,
        unassigned: preset.params.unassigned === true,
        stale: preset.params.stale === true,
        excludeClosed: preset.params.excludeClosed === true,
      } as Parameters<typeof listAlerts>[0]),
    enabled: !authLoading && hasAccessToken,
  });

  const total = query.data?.total ?? 0;
  const items = query.data?.items ?? [];

  const setView = (next: string) => {
    router.push(`/queue?view=${next}&offset=0`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {Object.entries(VIEWS).map(([key, v]) => (
          <button
            key={key}
            type="button"
            onClick={() => setView(key)}
            className={`rounded px-3 py-1.5 text-[12px] ${
              view === key
                ? "bg-[var(--color-accent-default)] text-white"
                : "border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)]"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <p className="text-[12px] text-[var(--color-text-secondary)]">
        {total.toLocaleString()} matching cases
      </p>

      {query.isPending ? (
        <div className="p-6 text-[13px]">Loading queue…</div>
      ) : (
        <>
          <AlertQueueTable
            alerts={items}
            onSelect={(id) => router.push(`/cases/${id}`)}
          />
          <div className="flex justify-between text-[12px]">
            <button
              type="button"
              className="btn"
              disabled={offset === 0}
              onClick={() => router.push(`/queue?view=${view}&offset=${Math.max(0, offset - limit)}`)}
            >
              Prev
            </button>
            <button
              type="button"
              className="btn"
              disabled={offset + limit >= total}
              onClick={() => router.push(`/queue?view=${view}&offset=${offset + limit}`)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
