import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  severityLabel,
  severityVariant,
  statusLabel,
  statusVariant,
} from "@/features/alerts/adapters/alertView";
import { anomalyLabel } from "@/lib/domain/labels";
import { caseDetailHref } from "@/lib/navigation/caseReturn";
import { formatRelativeDate } from "@/lib/utils";
import type { Alert } from "@/types/domain";
import { ArrowRight } from "lucide-react";

type Props = {
  alerts: Alert[];
  isLoading?: boolean;
};

export function PriorityQueuePreview({ alerts, isLoading }: Props) {
  return (
    <Card className="flex h-full flex-col p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
            Priority queue
          </div>
          <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">
            Highest-severity open cases
          </p>
        </div>
        <Link
          href="/queue?view=open&severity=high"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-accent-default)] hover:underline"
        >
          View all
          <ArrowRight size={12} />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-[var(--color-background-secondary)]" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <p className="text-[12px] text-[var(--color-text-secondary)]">No high-severity open cases right now.</p>
      ) : (
        <ul className="divide-y divide-[var(--color-border-tertiary)]">
          {alerts.map((a) => (
            <li key={a.id}>
              <Link
                href={caseDetailHref(a.id, "queue")}
                className="flex flex-wrap items-center gap-2 py-2.5 text-[12px] transition hover:bg-[var(--color-background-secondary)]"
              >
                <span className="min-w-[3rem] text-[15px] font-bold tracking-tight">{a.symbol}</span>
                <span className="text-[var(--color-text-secondary)]">{anomalyLabel(a.anomalyType)}</span>
                <Badge variant={severityVariant(a.severity)}>{severityLabel(a.severity)}</Badge>
                <Badge variant={statusVariant(a.status)}>{statusLabel(a.status)}</Badge>
                {a.anomalyScore != null ? (
                  <span className="mono text-[10px] text-[var(--color-text-tertiary)]">
                    score {a.anomalyScore.toFixed(3)}
                  </span>
                ) : null}
                <span className="ml-auto text-[11px] text-[var(--color-text-tertiary)]">
                  {formatRelativeDate(a.updatedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
