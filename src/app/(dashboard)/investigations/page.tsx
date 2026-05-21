"use client";

import { Panel, PanelHead } from "@/components/ui/Panel";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api/client";
import { listInvestigations } from "@/lib/api/endpoints/investigations";
import { queryKeys } from "@/lib/api/queryKeys";
import { formatRelativeDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

function SkeletonRow() {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border-tertiary)] px-4 py-3">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 animate-pulse rounded bg-[var(--color-background-secondary)]" />
          <div className="h-3 w-24 animate-pulse rounded bg-[var(--color-background-secondary)]" />
        </div>
        <div className="h-3 w-64 animate-pulse rounded bg-[var(--color-background-secondary)]" />
      </div>
      <div className="h-3 w-12 animate-pulse rounded bg-[var(--color-background-secondary)]" />
    </div>
  );
}

export default function InvestigationsPage() {
  const { hasAccessToken, isLoading: authLoading } = useAuth();
  const enabled = !authLoading && hasAccessToken;

  const { data, isPending, isError, error } = useQuery({
    queryKey: queryKeys.investigations.list({ offset: 0, limit: 30 }),
    queryFn: () => listInvestigations({ offset: 0, limit: 30 }),
    enabled,
  });

  return (
    <Panel>
      <PanelHead title="Investigation queue" />

      {isPending ? (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </>
      ) : isError ? (
        <div className="p-6 text-[12px] text-[#A32D2D]">
          {error instanceof ApiError
            ? error.message
            : "Failed to load investigations. Check backend connection."}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="p-6 text-[12px] text-[var(--color-text-secondary)]">
          No investigations available.
        </div>
      ) : (
        <div>
          {data?.items.map((item) => {
            const verdictColor =
              item.verdict === "ESCALATE"
                ? { bg: "#FDECEC", color: "#A32D2D", border: "#F4C7C7" }
                : item.verdict === "MONITOR"
                  ? { bg: "#FFF8E6", color: "#7D5A00", border: "#FFE8A3" }
                  : item.verdict === "DISMISS"
                    ? { bg: "#EDFAF3", color: "#1A6640", border: "#B3E8CC" }
                    : { bg: "#F3F4F6", color: "#6B7280", border: "#D1D5DB" };
            return (
              <Link
                key={item.id}
                href={`/investigations/${item.id}`}
                className="flex items-start justify-between gap-4 border-b border-[var(--color-border-tertiary)] px-4 py-3 hover:bg-[var(--color-background-secondary)]"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    {item.verdict ? (
                      <span
                        style={{
                          padding: "1px 7px",
                          borderRadius: 3,
                          fontSize: 10,
                          fontWeight: 700,
                          background: verdictColor.bg,
                          color: verdictColor.color,
                          border: `1px solid ${verdictColor.border}`,
                          flexShrink: 0,
                        }}
                      >
                        {item.verdict}
                      </span>
                    ) : null}
                    <span className="text-[11px] text-[var(--color-text-secondary)]">
                      Alert {item.alertId.slice(0, 8)}…
                    </span>
                  </div>
                  {item.summary ? (
                    <p className="truncate text-[12px] text-[var(--color-text-secondary)]">
                      {item.summary}
                    </p>
                  ) : null}
                </div>
                <div className="shrink-0 text-[11px] text-[var(--color-text-secondary)]">
                  {formatRelativeDate(item.updatedAt)}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
