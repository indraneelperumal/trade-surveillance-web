import { Panel, PanelHead } from "@/components/ui/Panel";
import { getAlert } from "@/lib/api/endpoints/alerts";

export default async function AlertDetailPage({
  params,
}: {
  params: Promise<{ alertId: string }>;
}) {
  const { alertId } = await params;
  let alert: Awaited<ReturnType<typeof getAlert>> | null = null;

  try {
    alert = await getAlert(alertId);
  } catch {
    alert = null;
  }

  if (!alert) {
    return (
      <Panel>
        <PanelHead title="Alert unavailable" />
        <div className="p-4 text-[12px] text-[#A32D2D]">
          Unable to load alert details. Check backend connection.
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHead title={`Alert ${alert.id}`} />
      <div className="space-y-3 p-4 text-[13px]">
        <div className="flex justify-between">
          <span className="text-[var(--color-text-secondary)]">Symbol</span>
          <span className="font-medium">{alert.symbol}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-text-secondary)]">Anomaly Type</span>
          <span className="font-medium">{alert.anomalyType}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-text-secondary)]">Status</span>
          <span className="font-medium">{alert.status}</span>
        </div>
      </div>
    </Panel>
  );
}
