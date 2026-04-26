import { OverviewDashboard } from "@/features/overview/OverviewDashboard";
import { getOverviewMetrics } from "@/lib/api/endpoints/metrics";
import { listAlerts } from "@/lib/api/endpoints/alerts";
import { listModelRuns } from "@/lib/api/endpoints/modelRuns";
import { listTrades } from "@/lib/api/endpoints/trades";

export default async function OverviewPage() {
  let metrics: Awaited<ReturnType<typeof getOverviewMetrics>> | null = null;
  let modelRuns: Awaited<ReturnType<typeof listModelRuns>> | null = null;
  let trades: Awaited<ReturnType<typeof listTrades>> | null = null;
  let recentAlerts: Awaited<ReturnType<typeof listAlerts>> | null = null;

  const results = await Promise.allSettled([
    getOverviewMetrics(),
    listModelRuns({ offset: 0, limit: 5 }),
    listTrades({ offset: 0, limit: 15 }),
    listAlerts({ offset: 0, limit: 12 }),
  ]);

  if (results[0].status === "fulfilled") metrics = results[0].value;
  if (results[1].status === "fulfilled") modelRuns = results[1].value;
  if (results[2].status === "fulfilled") trades = results[2].value;
  if (results[3].status === "fulfilled") recentAlerts = results[3].value;

  return (
    <OverviewDashboard
      metrics={metrics}
      modelRuns={modelRuns?.items ?? []}
      recentTrades={trades?.items ?? []}
      recentAlerts={recentAlerts?.items ?? []}
    />
  );
}
