import { Card } from "@/components/ui/Card";
import { listAlerts } from "@/lib/api/endpoints/alerts";
import { listModelRuns } from "@/lib/api/endpoints/modelRuns";

export default async function OverviewPage() {
  let alerts: Awaited<ReturnType<typeof listAlerts>> | null = null;
  let modelRuns: Awaited<ReturnType<typeof listModelRuns>> | null = null;

  try {
    [alerts, modelRuns] = await Promise.all([
      listAlerts({ offset: 0, limit: 50 }),
      listModelRuns({ offset: 0, limit: 5 }),
    ]);
  } catch {
    alerts = null;
    modelRuns = null;
  }

  if (!alerts || !modelRuns) {
    return (
      <Card className="p-4">
        <div className="text-[12px] text-[#A32D2D]">
          Backend unavailable. Overview data cannot be loaded right now.
        </div>
      </Card>
    );
  }

  const openCount = alerts.items.filter((item) => item.status === "open").length;
  const inProgressCount = alerts.items.filter(
    (item) => item.status === "in-progress",
  ).length;
  const closedCount = alerts.items.filter((item) => item.status === "closed").length;
  const latestRun = modelRuns.items[0];

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4">
        <div className="mb-2 text-[11px] tracking-[0.06em] text-[var(--color-text-secondary)] uppercase">
          Alert status
        </div>
        <div className="space-y-2 text-[13px]">
          <div>Open: {openCount}</div>
          <div>In progress: {inProgressCount}</div>
          <div>Closed: {closedCount}</div>
        </div>
      </Card>
      <Card className="p-4">
        <div className="mb-2 text-[11px] tracking-[0.06em] text-[var(--color-text-secondary)] uppercase">
          Latest model run
        </div>
        {latestRun ? (
          <div className="space-y-2 text-[13px]">
            <div>Run: {latestRun.id}</div>
            <div>Status: {latestRun.status}</div>
            <div>
              Precision:{" "}
              {typeof latestRun.precision === "number"
                ? `${Math.round(latestRun.precision * 100)}%`
                : "-"}
            </div>
          </div>
        ) : (
          <p className="text-[12px] text-[var(--color-text-secondary)]">No model runs yet.</p>
        )}
      </Card>
    </div>
  );
}
