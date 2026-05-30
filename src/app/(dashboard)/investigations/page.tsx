"use client";

import { Panel, PanelHead } from "@/components/ui/Panel";
import { SearchInput } from "@/components/ui/SearchInput";
import { Chip } from "@/components/ui/Chip";
import { useAuth } from "@/contexts/AuthContext";
import {
  InvestigationQueueRow,
  InvestigationQueueSkeletonRow,
} from "@/features/investigations/components/InvestigationQueueRow";
import { useInvestigationListContext } from "@/features/investigations/hooks/useInvestigationListContext";
import { anomalyLabel } from "@/lib/domain/labels";
import { ApiError } from "@/lib/api/client";
import { listInvestigations } from "@/lib/api/endpoints/investigations";
import { queryKeys } from "@/lib/api/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

const VERDICT_FILTERS = [
  { value: "all", label: "All verdicts" },
  { value: "ESCALATE", label: "Escalate" },
  { value: "MONITOR", label: "Monitor" },
  { value: "DISMISS", label: "Dismiss" },
];

function matchesSearch(
  needle: string,
  item: ReturnType<typeof useInvestigationListContext>["items"][number],
): boolean {
  const { investigation, alert, trade } = item;
  const haystack = [
    investigation.alertId,
    investigation.summary,
    investigation.verdict,
    investigation.ruleViolated,
    investigation.confidence,
    alert?.symbol,
    alert?.anomalyType,
    alert?.traderId,
    alert?.assignee,
    alert?.anomalyType ? anomalyLabel(alert.anomalyType) : null,
    trade?.traderId,
    trade?.side,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export default function InvestigationsPage() {
  const { hasAccessToken, isLoading: authLoading } = useAuth();
  const enabled = !authLoading && hasAccessToken;
  const [search, setSearch] = useState("");
  const [verdict, setVerdict] = useState("all");

  const { data, isPending, isError, error } = useQuery({
    queryKey: queryKeys.investigations.list({ offset: 0, limit: 50 }),
    queryFn: () => listInvestigations({ offset: 0, limit: 50 }),
    enabled,
    refetchInterval: 5000,
  });

  const investigations = data?.items ?? [];
  const { items, isLoadingContext } = useInvestigationListContext({
    enabled: enabled && investigations.length > 0,
    investigations,
  });

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return items.filter((item) => {
      const v = (item.investigation.verdict ?? "").toUpperCase();
      if (verdict !== "all" && v !== verdict) return false;
      if (!needle) return true;
      return matchesSearch(needle, item);
    });
  }, [items, search, verdict]);

  const showSkeleton = isPending || (investigations.length > 0 && isLoadingContext);

  return (
    <Panel>
      <PanelHead title="Investigation queue" />
      <div className="space-y-3 border-b border-[var(--color-border-tertiary)] px-4 py-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search symbol, trader, anomaly, rule, or verdict…"
        />
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
            Verdict
          </span>
          {VERDICT_FILTERS.map((opt) => (
            <Chip key={opt.value} active={verdict === opt.value} onClick={() => setVerdict(opt.value)}>
              {opt.label}
            </Chip>
          ))}
        </div>
        <p className="text-[11px] text-[var(--color-text-secondary)]">
          {filtered.length} of {data?.items.length ?? 0} investigations shown · each row links to the full case
        </p>
      </div>

      {showSkeleton ? (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <InvestigationQueueSkeletonRow key={i} />
          ))}
        </>
      ) : isError ? (
        <div className="p-6 text-[12px] text-[#A32D2D]">
          {error instanceof ApiError
            ? error.message
            : "Failed to load investigations. Check backend connection."}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-6 text-[12px] text-[var(--color-text-secondary)]">
          No investigations match your filters.
        </div>
      ) : (
        <div>
          {filtered.map((item) => (
            <InvestigationQueueRow key={item.investigation.id} item={item} />
          ))}
        </div>
      )}
    </Panel>
  );
}
