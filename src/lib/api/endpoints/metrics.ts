import { apiFetch } from "@/lib/api/client";

export type SymbolAlertCount = {
  symbol: string;
  count: number;
};

export type AssigneeOpenCount = {
  userId: string;
  email: string;
  displayName?: string | null;
  openCount: number;
};

export type OverviewMetrics = {
  totalAlerts: number;
  totalTrades: number;
  alertsByStatus: Record<string, number>;
  alertsBySeverity: Record<string, number>;
  alertsByAnomalyType: Record<string, number>;
  openAlertsBySeverity: Record<string, number>;
  openHighSeverityCount: number;
  topSymbolsByAlerts: SymbolAlertCount[];
  openUnassignedHigh: number;
  pendingOfficerReview: number;
  staleOpen24h: number;
  slaBreachCount: number;
  alertsPerAssignee: AssigneeOpenCount[];
};

export function getOverviewMetrics() {
  return apiFetch<OverviewMetrics>("/api/v1/metrics/overview");
}
