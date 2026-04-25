import { Panel, PanelHead } from "@/components/ui/Panel";
import { listInvestigations } from "@/lib/api/endpoints/investigations";
import { formatRelativeDate } from "@/lib/utils";
import Link from "next/link";

export default async function InvestigationsPage() {
  let investigations: Awaited<ReturnType<typeof listInvestigations>> | null = null;

  try {
    investigations = await listInvestigations({ offset: 0, limit: 30 });
  } catch {
    investigations = null;
  }

  if (!investigations) {
    return (
      <Panel>
        <PanelHead title="Investigation queue" />
        <div className="p-6 text-[12px] text-[#A32D2D]">
          Backend unavailable. Confirm API server is running and reachable.
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHead title="Investigation queue" />
      {investigations.items.length === 0 ? (
        <div className="p-6 text-[12px] text-[var(--color-text-secondary)]">
          No investigations available.
        </div>
      ) : (
        <div>
          {investigations.items.map((item) => (
            <Link
              key={item.id}
              href={`/investigations/${item.id}`}
              className="flex items-center justify-between border-b border-[var(--color-border-tertiary)] px-4 py-3 text-[13px] hover:bg-[var(--color-background-secondary)]"
            >
              <div>
                <div className="font-medium">{item.id}</div>
                <div className="text-[12px] text-[var(--color-text-secondary)]">
                  Alert {item.alertId}
                </div>
              </div>
              <div className="text-[12px] text-[var(--color-text-secondary)]">
                {formatRelativeDate(item.updatedAt)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </Panel>
  );
}
