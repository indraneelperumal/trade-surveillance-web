"use client";

import { SearchInput } from "@/components/ui/SearchInput";
import { Chip } from "@/components/ui/Chip";
import { ANOMALY_LABELS } from "@/lib/domain/labels";

export type QueueFilterState = {
  q: string;
  severity: string;
  status: string;
  anomalyType: string;
};

type QueueSearchToolbarProps = {
  filters: QueueFilterState;
  onChange: (patch: Partial<QueueFilterState>) => void;
  /** Hide status when a queue view preset already sets status */
  hideStatus?: boolean;
};

const severityOptions = [
  { value: "all", label: "All severity" },
  { value: "high", label: "High" },
  { value: "med", label: "Medium" },
  { value: "low", label: "Low" },
];

const statusOptions = [
  { value: "all", label: "All status" },
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In progress" },
  { value: "pending_officer_review", label: "Pending officer" },
  { value: "closed", label: "Closed" },
];

const anomalyOptions = [
  { value: "all", label: "All types" },
  ...Object.entries(ANOMALY_LABELS).map(([value, label]) => ({ value, label })),
];

export function QueueSearchToolbar({
  filters,
  onChange,
  hideStatus = false,
}: QueueSearchToolbarProps) {
  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] p-3">
      <SearchInput
        value={filters.q}
        onChange={(q) => onChange({ q })}
        placeholder="Search symbol (e.g. AAPL), trader ID, or alert…"
      />
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
          Severity
        </span>
        {severityOptions.map((opt) => (
          <Chip
            key={opt.value}
            active={filters.severity === opt.value}
            onClick={() => onChange({ severity: opt.value })}
          >
            {opt.label}
          </Chip>
        ))}
      </div>
      {!hideStatus && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
            Status
          </span>
          {statusOptions.map((opt) => (
            <Chip
              key={opt.value}
              active={filters.status === opt.value}
              onClick={() => onChange({ status: opt.value })}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
          Anomaly
        </span>
        <select
          value={filters.anomalyType}
          onChange={(e) => onChange({ anomalyType: e.target.value })}
          className="rounded-md border border-[var(--color-border-secondary)] bg-[var(--color-background-primary)] px-2 py-1 text-[11px] text-[var(--color-text-primary)]"
        >
          {anomalyOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/** Resolve API symbol param from free-text search. */
export function symbolFromSearch(q: string): string | undefined {
  const trimmed = q.trim().toUpperCase();
  if (/^[A-Z]{1,6}$/.test(trimmed)) return trimmed;
  return undefined;
}

/** Client-side filter when search is not an exact ticker. */
export function filterAlertsClient<T extends { symbol: string; id: string; traderId?: string | null }>(
  items: T[],
  q: string,
): T[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return items;
  if (/^[a-z]{1,6}$/i.test(needle)) {
    return items.filter((a) => a.symbol.toLowerCase().includes(needle));
  }
  return items.filter(
    (a) =>
      a.symbol.toLowerCase().includes(needle) ||
      a.id.toLowerCase().includes(needle) ||
      (a.traderId?.toLowerCase().includes(needle) ?? false),
  );
}
