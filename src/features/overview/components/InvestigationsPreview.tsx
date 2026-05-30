import Link from "next/link";
import { Card } from "@/components/ui/Card";
import {
  verdictBadgeClass,
  verdictLabel,
} from "@/features/investigations/adapters/investigationView";
import { caseDetailHref } from "@/lib/navigation/caseReturn";
import { formatRelativeDate } from "@/lib/utils";
import type { Alert, Investigation } from "@/types/domain";
import { ArrowRight } from "lucide-react";

type Props = {
  investigations: Investigation[];
  alertById: Map<string, Alert>;
  isLoading?: boolean;
};

export function InvestigationsPreview({ investigations, alertById, isLoading }: Props) {
  return (
    <Card className="flex h-full flex-col p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
            AI investigations
          </div>
          <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">
            Latest agent verdicts
          </p>
        </div>
        <Link
          href="/investigations"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-accent-default)] hover:underline"
        >
          Full list
          <ArrowRight size={12} />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-md bg-[var(--color-background-secondary)]" />
          ))}
        </div>
      ) : investigations.length === 0 ? (
        <p className="text-[12px] text-[var(--color-text-secondary)]">No investigations completed yet.</p>
      ) : (
        <ul className="divide-y divide-[var(--color-border-tertiary)]">
          {investigations.map((inv) => {
            const alert = alertById.get(inv.alertId);
            return (
              <li key={inv.id}>
                <Link
                  href={caseDetailHref(inv.alertId, "investigations")}
                  className="block py-2.5 transition hover:bg-[var(--color-background-secondary)]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-bold">{alert?.symbol ?? "—"}</span>
                    <span className={verdictBadgeClass(inv.verdict)}>{verdictLabel(inv.verdict)}</span>
                    {inv.confidence ? (
                      <span className="text-[10px] text-[var(--color-text-tertiary)]">{inv.confidence}</span>
                    ) : null}
                    <span className="ml-auto text-[11px] text-[var(--color-text-tertiary)]">
                      {formatRelativeDate(inv.updatedAt)}
                    </span>
                  </div>
                  {inv.summary ? (
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
                      {inv.summary}
                    </p>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
