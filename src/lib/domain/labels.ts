import type { AlertStatus, Severity } from "@/types/domain";

export const ANOMALY_LABELS: Record<string, string> = {
  fat_finger: "Fat finger",
  volume_spike: "Volume spike",
  off_hours: "Off-hours",
  spoofing: "Spoofing",
  wash_trade: "Wash trade pattern",
  multi_flag: "Multiple signals",
  unknown: "Unclassified",
};

export const ANOMALY_THEME: Record<string, string> = {
  fat_finger: "Erroneous entry / control failure",
  volume_spike: "Unusual volume",
  off_hours: "Trading hours / policy",
  spoofing: "Layering / spoofing (US)",
  wash_trade: "Wash / self-trade risk",
  multi_flag: "Combined surveillance hit",
  unknown: "Manual review required",
};

export const DISPOSITION_OPTIONS = [
  { value: "FALSE_POSITIVE", label: "False positive" },
  { value: "NO_ACTION_REQUIRED", label: "No action required" },
  { value: "CLEARED_WITH_MONITORING", label: "Cleared — continue monitoring" },
  { value: "ESCALATED_TO_REGULATOR", label: "Escalated to regulator" },
] as const;

export function anomalyLabel(type: string) {
  return ANOMALY_LABELS[type] ?? type.replace(/_/g, " ");
}

export function statusLabelV2(status: AlertStatus | string) {
  const s = String(status).toLowerCase();
  if (s === "pending-officer-review" || s === "pending_officer_review") {
    return "Pending officer review";
  }
  if (s === "in-progress" || s === "in_progress") return "In progress";
  if (s === "open") return "Open";
  if (s === "closed") return "Closed";
  return status;
}

export function roleLabel(role: string) {
  return role === "COMPLIANCE_LEAD" ? "Compliance officer" : "Analyst";
}

export function defaultRouteForRole(role: string) {
  return role === "COMPLIANCE_LEAD" ? "/overview" : "/queue";
}

export function isOfficer(role: string) {
  return role === "COMPLIANCE_LEAD";
}
