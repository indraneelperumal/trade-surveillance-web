"use client";

import { Panel, PanelHead } from "@/components/ui/Panel";
import { useAuth } from "@/contexts/AuthContext";
import { getInvestigation } from "@/lib/api/endpoints/investigations";
import { queryKeys } from "@/lib/api/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { use } from "react";

function SkeletonField() {
  return (
    <div className="space-y-1.5">
      <div className="h-2.5 w-24 animate-pulse rounded bg-[var(--color-background-secondary)]" />
      <div className="h-3 w-full animate-pulse rounded bg-[var(--color-background-secondary)]" />
      <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--color-background-secondary)]" />
    </div>
  );
}

export default function InvestigationDetailPage({
  params,
}: {
  params: Promise<{ investigationId: string }>;
}) {
  const { investigationId } = use(params);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const enabled = !authLoading && isAuthenticated && Boolean(investigationId);

  const { data: investigation, isPending, isError } = useQuery({
    queryKey: queryKeys.investigations.detail(investigationId),
    queryFn: () => getInvestigation(investigationId),
    enabled,
  });

  if (!investigationId) {
    return (
      <Panel>
        <PanelHead title="Investigation not found" />
        <div className="p-4 text-[12px] text-[#A32D2D]">No investigation ID provided.</div>
      </Panel>
    );
  }

  if (isPending) {
    return (
      <Panel>
        <PanelHead title="Investigation" />
        <div className="space-y-4 p-4">
          <div className="flex gap-2">
            <div className="h-6 w-20 animate-pulse rounded bg-[var(--color-background-secondary)]" />
            <div className="h-6 w-16 animate-pulse rounded bg-[var(--color-background-secondary)]" />
          </div>
          <SkeletonField />
          <SkeletonField />
          <SkeletonField />
        </div>
      </Panel>
    );
  }

  if (isError || !investigation) {
    return (
      <Panel>
        <PanelHead title="Investigation unavailable" />
        <div className="p-4 text-[12px] text-[#A32D2D]">
          Unable to load investigation details. Check backend connection.
        </div>
      </Panel>
    );
  }

  const verdictColor =
    investigation.verdict === "ESCALATE"
      ? { bg: "#FDECEC", color: "#A32D2D", border: "#F4C7C7" }
      : investigation.verdict === "MONITOR"
        ? { bg: "#FFF8E6", color: "#7D5A00", border: "#FFE8A3" }
        : investigation.verdict === "DISMISS"
          ? { bg: "#EDFAF3", color: "#1A6640", border: "#B3E8CC" }
          : { bg: "#F3F4F6", color: "#6B7280", border: "#D1D5DB" };

  return (
    <Panel>
      <PanelHead title={`Investigation · ${investigation.id.slice(0, 8)}…`} />
      <div className="space-y-4 p-4 text-[13px]">
        {/* Verdict + confidence row */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 700,
              background: verdictColor.bg,
              color: verdictColor.color,
              border: `1px solid ${verdictColor.border}`,
            }}
          >
            {investigation.verdict ?? "PENDING"}
          </span>
          {investigation.confidence ? (
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 600,
                border: "1px solid #D1D5DB",
                background: "#F3F4F6",
                color: "#6B7280",
              }}
            >
              {investigation.confidence} confidence
            </span>
          ) : null}
          {investigation.modelVersion ? (
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 10,
                fontFamily: "monospace",
                border: "1px solid #D1D5DB",
                background: "#F3F4F6",
                color: "#6B7280",
              }}
            >
              {investigation.modelVersion}
            </span>
          ) : null}
        </div>

        <div className="flex justify-between text-[12px]">
          <span className="text-[var(--color-text-secondary)]">Alert</span>
          <span className="font-mono font-medium">{investigation.alertId}</span>
        </div>

        {investigation.ruleViolated ? (
          <div className="text-[12px]">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Rule violated
            </div>
            <p className="text-[var(--color-text-secondary)]">{investigation.ruleViolated}</p>
          </div>
        ) : null}

        {investigation.summary ? (
          <div className="text-[12px]">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Summary
            </div>
            <p className="leading-5 text-[var(--color-text-primary)]">{investigation.summary}</p>
          </div>
        ) : null}

        {investigation.evidencePoints && investigation.evidencePoints.length > 0 ? (
          <div className="text-[12px]">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Evidence · {investigation.evidencePoints.length} points
            </div>
            <ol className="space-y-2">
              {investigation.evidencePoints.map((point, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-secondary)] bg-[var(--color-background-secondary)] text-[9px] font-semibold text-[var(--color-text-secondary)]">
                    {i + 1}
                  </span>
                  <span className="leading-5 text-[var(--color-text-secondary)]">{point}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {investigation.recommendedAction ? (
          <div className="text-[12px]">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Recommended action
            </div>
            <p className="leading-5 text-[var(--color-text-secondary)]">
              {investigation.recommendedAction}
            </p>
          </div>
        ) : null}

        {investigation.dataGaps ? (
          <div className="text-[12px]">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Data gaps flagged
            </div>
            <p className="leading-5 text-[var(--color-text-secondary)]">{investigation.dataGaps}</p>
          </div>
        ) : null}

        {investigation.errorMessage ? (
          <div className="rounded-[6px] border border-[#F4C7C7] bg-[#FDECEC] px-3 py-2 text-[11px] text-[#A32D2D]">
            {investigation.errorMessage}
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
