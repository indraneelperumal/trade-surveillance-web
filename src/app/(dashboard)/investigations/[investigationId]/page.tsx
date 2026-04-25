import { Panel, PanelHead } from "@/components/ui/Panel";
import { getInvestigation } from "@/lib/api/endpoints/investigations";

export default async function InvestigationDetailPage({
  params,
}: {
  params: Promise<{ investigationId: string }>;
}) {
  const { investigationId } = await params;
  let investigation: Awaited<ReturnType<typeof getInvestigation>> | null = null;

  try {
    investigation = await getInvestigation(investigationId);
  } catch {
    investigation = null;
  }

  if (!investigation) {
    return (
      <Panel>
        <PanelHead title="Investigation unavailable" />
        <div className="p-4 text-[12px] text-[#A32D2D]">
          Unable to load investigation details. Check backend connection.
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHead title={`Investigation ${investigation.id}`} />
      <div className="space-y-3 p-4 text-[13px]">
        <div className="flex justify-between">
          <span className="text-[var(--color-text-secondary)]">Alert</span>
          <span className="font-medium">{investigation.alertId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-text-secondary)]">Verdict</span>
          <span className="font-medium">{investigation.verdict ?? "Pending"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-text-secondary)]">Confidence</span>
          <span className="font-medium">
            {typeof investigation.confidence === "number"
              ? `${Math.round(investigation.confidence * 100)}%`
              : "-"}
          </span>
        </div>
        <p className="text-[12px] leading-5 text-[var(--color-text-secondary)]">
          {investigation.summary ?? "No summary yet."}
        </p>
      </div>
    </Panel>
  );
}
