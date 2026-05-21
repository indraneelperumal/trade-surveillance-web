import { AlertStatus, Severity } from "@/types/domain";

export function severityLabel(value: Severity) {
  if (value === "med") return "Medium";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function severityVariant(value: Severity) {
  if (value === "high") return "severity-high";
  if (value === "med") return "severity-med";
  if (value === "low") return "severity-low";
  return "severity-none";
}

export function statusLabel(value: AlertStatus) {
  if (value === "open") return "Open";
  if (value === "in-progress") return "In progress";
  if (value === "pending-officer-review") return "Pending officer";
  if (value === "escalated") return "Pending officer";
  return "Closed";
}

export function statusVariant(value: AlertStatus) {
  if (value === "open") return "status-open";
  if (value === "in-progress") return "status-prog";
  if (value === "pending-officer-review" || value === "escalated") return "status-prog";
  return "status-closed";
}
