import { apiFetch } from "@/lib/api/client";
import type { ListQuery, PaginatedResponse } from "@/types/api";
import type { Alert } from "@/types/domain";

export type AlertListQuery = ListQuery & {
  status?: string;
  severity?: string;
  symbol?: string;
  anomalyType?: string;
};

export function listAlerts(query: AlertListQuery) {
  return apiFetch<PaginatedResponse<Alert>>("/api/v1/alerts", { query });
}

export function getAlert(alertId: string) {
  return apiFetch<Alert>(`/api/v1/alerts/${alertId}`);
}

export function patchAlert(
  alertId: string,
  payload: Partial<Pick<Alert, "status" | "disposition" | "assignee">>,
) {
  return apiFetch<Alert>(`/api/v1/alerts/${alertId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
