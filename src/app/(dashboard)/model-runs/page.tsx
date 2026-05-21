"use client";

import { Card } from "@/components/ui/Card";
import { Panel, PanelHead } from "@/components/ui/Panel";
import { useAuth } from "@/contexts/AuthContext";
import { listModelRuns } from "@/lib/api/endpoints/modelRuns";
import { queryKeys } from "@/lib/api/queryKeys";
import { formatRelativeDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

function KpiSkeleton() {
  return (
    <Card className="p-4">
      <div className="mb-1 h-2.5 w-16 animate-pulse rounded bg-[var(--color-background-secondary)]" />
      <div className="h-6 w-20 animate-pulse rounded bg-[var(--color-background-secondary)]" />
    </Card>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-2 border-b border-[var(--color-border-tertiary)] px-4 py-2.5">
      <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-background-secondary)]" />
      <div className="h-3 flex-1 animate-pulse rounded bg-[var(--color-background-secondary)]" />
      <div className="h-3 w-16 animate-pulse rounded bg-[var(--color-background-secondary)]" />
      <div className="h-3 w-20 animate-pulse rounded bg-[var(--color-background-secondary)]" />
    </div>
  );
}

export default function ModelRunsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const enabled = !authLoading && isAuthenticated;

  const { data: modelRuns, isPending, isError } = useQuery({
    queryKey: queryKeys.modelRuns.list({ offset: 0, limit: 20 }),
    queryFn: () => listModelRuns({ offset: 0, limit: 20 }),
    enabled,
  });

  const latest =
    modelRuns?.items.find((r) => r.status === "COMPLETED") ?? modelRuns?.items[0];

  if (isError) {
    return (
      <Card className="p-4">
        <div className="text-[12px] text-[#A32D2D]">
          Failed to load model runs. Check backend connection.
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {isPending ? (
          <>
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </>
        ) : (
          <>
            <Card className="p-4">
              <div className="mb-1 text-[11px] text-[var(--color-text-secondary)] uppercase">
                Latest run
              </div>
              <div className="truncate text-lg font-medium">{latest?.id.slice(0, 8) ?? "-"}…</div>
            </Card>
            <Card className="p-4">
              <div className="mb-1 text-[11px] text-[var(--color-text-secondary)] uppercase">
                Precision
              </div>
              <div className="text-lg font-medium">
                {typeof latest?.precision === "number"
                  ? `${Math.round(latest.precision * 100)}%`
                  : "-"}
              </div>
            </Card>
            <Card className="p-4">
              <div className="mb-1 text-[11px] text-[var(--color-text-secondary)] uppercase">
                Recall
              </div>
              <div className="text-lg font-medium">
                {typeof latest?.recall === "number"
                  ? `${Math.round(latest.recall * 100)}%`
                  : "-"}
              </div>
            </Card>
            <Card className="p-4">
              <div className="mb-1 text-[11px] text-[var(--color-text-secondary)] uppercase">
                Flagged
              </div>
              <div className="text-lg font-medium">{latest?.flaggedCount ?? "-"}</div>
            </Card>
            <Card className="p-4">
              <div className="mb-1 text-[11px] text-[var(--color-text-secondary)] uppercase">
                Runtime
              </div>
              <div className="text-lg font-medium">
                {typeof latest?.runtimeSeconds === "number"
                  ? `${latest.runtimeSeconds.toFixed(1)}s`
                  : "-"}
              </div>
            </Card>
          </>
        )}
      </div>

      <Panel>
        <PanelHead title="Recent model runs" />
        {isPending ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <RowSkeleton key={i} />
            ))}
          </>
        ) : modelRuns?.items.length === 0 ? (
          <div className="p-6 text-[12px] text-[var(--color-text-secondary)]">
            No model runs available.
          </div>
        ) : (
          modelRuns?.items.map((run) => (
            <div
              key={run.id}
              className="flex items-center gap-2 border-b border-[var(--color-border-tertiary)] px-4 py-2.5 text-[12px] last:border-b-0"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background:
                    run.status === "COMPLETED"
                      ? "#3B6D11"
                      : run.status === "STARTED"
                        ? "#185FA5"
                        : "#A32D2D",
                }}
              />
              <span className="flex-1 font-mono text-[11px]">{run.id}</span>
              <span className="text-[var(--color-text-secondary)]">{run.status}</span>
              <span className="text-[var(--color-text-secondary)]">
                {formatRelativeDate(run.createdAt)}
              </span>
            </div>
          ))
        )}
      </Panel>
    </div>
  );
}
