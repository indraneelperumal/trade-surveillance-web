export type InvestigationVerdict = "ESCALATE" | "MONITOR" | "DISMISS" | string;

export function normalizeVerdict(verdict: string | null | undefined): string {
  return (verdict ?? "PENDING").toUpperCase();
}

export function verdictLabel(verdict: string | null | undefined): string {
  const v = normalizeVerdict(verdict);
  if (v === "ESCALATE") return "Escalate";
  if (v === "MONITOR") return "Monitor";
  if (v === "DISMISS") return "Dismiss";
  if (v === "PENDING") return "Pending";
  return verdict ?? "Pending";
}

export function verdictBadgeClass(verdict: string | null | undefined): string {
  const v = normalizeVerdict(verdict);
  if (v === "ESCALATE") return "verdict verdict-escalate";
  if (v === "MONITOR") return "verdict verdict-monitor";
  if (v === "DISMISS") return "verdict verdict-dismiss";
  return "verdict verdict-pending";
}

export function confidenceLabel(confidence: string | null | undefined): string | null {
  if (!confidence) return null;
  const c = confidence.toLowerCase();
  if (c === "high" || c === "medium" || c === "low") {
    return `${c.charAt(0).toUpperCase()}${c.slice(1)} confidence`;
  }
  return confidence;
}
