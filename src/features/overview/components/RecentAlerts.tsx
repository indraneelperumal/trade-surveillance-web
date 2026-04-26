import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatRelativeDate } from "@/lib/utils";
import type { Alert } from "@/types/domain";
import {
  severityLabel,
  severityVariant,
  statusLabel,
  statusVariant,
} from "@/features/alerts/adapters/alertView";

type Props = {
  alerts: Alert[];
};

export function RecentAlerts({ alerts }: Props) {
  return (
    <Card className="p-4">
      <div className="mb-3 text-[11px] tracking-[0.06em] text-[var(--color-text-secondary)] uppercase">
        Recent flags
      </div>
      {alerts.length === 0 ? (
        <p className="text-[12px] text-[var(--color-text-secondary)]">No alerts yet.</p>
      ) : (
        <ul className="divide-y divide-[var(--color-border-tertiary)]">
          {alerts.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-2 py-2.5 text-[12px] first:pt-0">
              <Link
                href={`/alerts?selected=${encodeURIComponent(a.id)}`}
                className="font-medium text-[#378ADD] hover:underline"
              >
                {a.symbol || "—"}
              </Link>
              <span className="text-[var(--color-text-secondary)]">{a.anomalyType}</span>
              <Badge variant={severityVariant(a.severity)}>{severityLabel(a.severity)}</Badge>
              <Badge variant={statusVariant(a.status)}>{statusLabel(a.status)}</Badge>
              <span className="ml-auto text-[11px] text-[var(--color-text-secondary)]">
                {formatRelativeDate(a.updatedAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
