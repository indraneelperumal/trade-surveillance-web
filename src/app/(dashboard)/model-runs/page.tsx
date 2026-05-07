import { Card } from "@/components/ui/Card";
import { Panel, PanelHead } from "@/components/ui/Panel";
import { listModelRuns } from "@/lib/api/endpoints/modelRuns";
import { formatRelativeDate } from "@/lib/utils";

export default async function ModelRunsPage() {
  let modelRuns: Awaited<ReturnType<typeof listModelRuns>> | null = null;

  try {
    modelRuns = await listModelRuns({ offset: 0, limit: 20 });
  } catch {
    modelRuns = null;
  }

  if (!modelRuns) {
    return (
      <Card className="p-4">
        <div className="text-[12px] text-[#A32D2D]">
          Backend unavailable. Model run data cannot be loaded right now.
        </div>
      </Card>
    );
  }

  const latest = modelRuns.items[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="mb-1 text-[11px] text-[var(--color-text-secondary)] uppercase">
            Latest run
          </div>
          <div className="text-lg font-medium">{latest?.id ?? "-"}</div>
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
            Flagged count
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
      </div>
      <Panel>
        <PanelHead title="Recent model runs" />
        {modelRuns.items.length === 0 ? (
          <div className="p-6 text-[12px] text-[var(--color-text-secondary)]">
            No model runs available.
          </div>
        ) : (
          modelRuns.items.map((run) => (
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
              <span className="flex-1 font-medium">{run.id}</span>
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
