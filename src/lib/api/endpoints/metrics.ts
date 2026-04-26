import { apiFetch } from "@/lib/api/client";

export type SymbolAlertCount = {
  symbol: string;
  count: number;
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
};

export function getOverviewMetrics() {
  return apiFetch<OverviewMetrics>("/api/v1/metrics/overview");
}
