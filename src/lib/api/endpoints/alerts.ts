import { normalizeAlert } from "@/lib/api/adapters/normalizeDomain";
import { apiFetch } from "@/lib/api/client";
import type { ListQuery, PaginatedResponse } from "@/types/api";
import type { Alert } from "@/types/domain";

export type AlertListQuery = ListQuery & {
  status?: string;
  severity?: string;
  symbol?: string;
  anomalyType?: string;
  assignedTo?: string;
  unassigned?: boolean;
  stale?: boolean;
  excludeClosed?: boolean;
};

export function listAlerts(query: AlertListQuery) {
  return apiFetch<PaginatedResponse<Record<string, unknown>>>("/api/v1/alerts", { query }).then(
    (res) => ({
      ...res,
      items: res.items.map((row) => normalizeAlert(row)),
    }),
  ) as Promise<PaginatedResponse<Alert>>;
}

export function getAlert(alertId: string) {
  return apiFetch<Record<string, unknown>>(`/api/v1/alerts/${alertId}`).then((row) =>
    normalizeAlert(row),
  );
}

export function patchAlert(
  alertId: string,
  payload: Partial<Pick<Alert, "status" | "disposition" | "assignee">>,
) {
  return apiFetch<Record<string, unknown>>(`/api/v1/alerts/${alertId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }).then((row) => normalizeAlert(row));
}
