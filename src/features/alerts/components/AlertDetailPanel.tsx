import { Badge } from "@/components/ui/Badge";
import { severityLabel, severityVariant, statusLabel, statusVariant } from "@/features/alerts/adapters/alertView";
import { AlertActionsForm, type AlertActionValues } from "@/features/alerts/components/AlertActionsForm";
import { InvestigationSummary } from "@/features/alerts/components/InvestigationSummary";
import { NotesTimeline } from "@/features/alerts/components/NotesTimeline";
import { TradeSnapshot } from "@/features/alerts/components/TradeSnapshot";
import type { Alert, Investigation, InvestigationNote, Trade } from "@/types/domain";

type AlertDetailPanelProps = {
  alert?: Alert;
  trade?: Trade | null;
  investigation?: Investigation | null;
  notes: InvestigationNote[];
  onSubmitAction: (values: AlertActionValues) => void;
};

export function AlertDetailPanel({
  alert,
  trade,
  investigation,
  notes,
  onSubmitAction,
}: AlertDetailPanelProps) {
  if (!alert) {
    return (
      <div className="p-6 text-center text-[12px] text-[var(--color-text-secondary)]">
        Click a row to inspect the alert, linked trade, and investigation notes.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <section className="border-b border-[var(--color-border-tertiary)] px-4 py-3">
        <div className="mb-2 text-[11px] tracking-[0.06em] text-[var(--color-text-secondary)] uppercase">
          Alert metadata
        </div>
        <div className="space-y-2 text-[12px]">
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Type</span>
            <span className="font-medium">{alert.anomalyType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Severity</span>
            <Badge variant={severityVariant(alert.severity)}>{severityLabel(alert.severity)}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Status</span>
            <Badge variant={statusVariant(alert.status)}>{statusLabel(alert.status)}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Assignee</span>
            <span className="font-medium">{alert.assignee ?? "Unassigned"}</span>
          </div>
        </div>
      </section>
      <section className="border-b border-[var(--color-border-tertiary)] px-4 py-3">
        <div className="mb-2 text-[11px] tracking-[0.06em] text-[var(--color-text-secondary)] uppercase">
          Trade snapshot
        </div>
        <TradeSnapshot trade={trade} />
      </section>
      <section className="border-b border-[var(--color-border-tertiary)] px-4 py-3">
        <div className="mb-2 text-[11px] tracking-[0.06em] text-[var(--color-text-secondary)] uppercase">
          Investigation
        </div>
        <InvestigationSummary investigation={investigation} />
      </section>
      <section className="border-b border-[var(--color-border-tertiary)] py-3">
        <div className="mb-2 px-4 text-[11px] tracking-[0.06em] text-[var(--color-text-secondary)] uppercase">
          Notes · {notes.length}
        </div>
        <NotesTimeline notes={notes} />
      </section>
      <AlertActionsForm onSubmit={onSubmitAction} />
    </div>
  );
}
