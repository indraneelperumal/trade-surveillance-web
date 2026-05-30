"use client";

import { ShieldAlert } from "lucide-react";
import { useRole } from "@/hooks/usePermissions";
import { severityLabel } from "@/features/alerts/adapters/alertView";
import type { AlertStatus, Severity } from "@/types/domain";

export type InvestigationUnavailableProps = {
  status: AlertStatus | string;
  severity: Severity | string;
  compact?: boolean;
};

function resolveMessage(
  status: string,
  severity: string,
  isAnalyst: boolean,
): { title: string; body: string } {
  const s = status.toLowerCase().replace(/_/g, "-");
  const sev = severity.toLowerCase();

  if (s === "closed") {
    return {
      title: "Case closed",
      body: isAnalyst
        ? "This case is closed. Contact your compliance officer if it needs to be reopened or re-reviewed."
        : "This case is closed. Reopen from the workflow panel if further review is required.",
    };
  }

  if (s === "pending-officer-review") {
    return {
      title: "Pending officer review",
      body: isAnalyst
        ? "This case has been escalated and is with a compliance officer. AI investigation cannot be started."
        : "Review this case in the officer queue. A new AI investigation cannot be started while officer review is active.",
    };
  }

  if (sev === "low" || sev === "none") {
    return {
      title: "AI investigation not available",
      body: isAnalyst
        ? `${severityLabel(severity as Severity)}-severity alerts are outside the automated AI investigation scope. Review trade and ML context manually, add notes in the workflow panel, or ask your compliance officer if you believe escalation is warranted.`
        : `Only HIGH and MEDIUM severity alerts qualify for automated AI investigation. This ${severityLabel(severity as Severity).toLowerCase()}-severity case should be handled through manual review.`,
    };
  }

  return {
    title: "AI investigation unavailable",
    body: isAnalyst
      ? "You cannot run an AI investigation on this case in its current state. Contact your compliance officer for guidance."
      : "An AI investigation cannot be started for this case right now. Check case status and existing investigation records.",
  };
}

export function InvestigationUnavailableNotice({
  status,
  severity,
  compact = false,
}: InvestigationUnavailableProps) {
  const { isAnalyst } = useRole();
  const { title, body } = resolveMessage(String(status), String(severity), isAnalyst);

  return (
    <div
      className={`callout-restricted ${compact ? "callout-restricted--compact" : ""}`}
      role="status"
    >
      <div className="callout-restricted__header">
        <ShieldAlert size={compact ? 14 : 16} className="callout-restricted__icon" aria-hidden />
        <p className="callout-restricted__title">{title}</p>
      </div>
      <p className="callout-restricted__body">{body}</p>
      {isAnalyst && (severity === "low" || severity === "none") && (
        <p className="callout-restricted__hint">
          Compliance officers can advise on manual disposition or escalation paths.
        </p>
      )}
    </div>
  );
}
