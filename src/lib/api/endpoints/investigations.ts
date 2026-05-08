import { apiFetch } from "@/lib/api/client";
import type { ListQuery, PaginatedResponse } from "@/types/api";
import type { Investigation } from "@/types/domain";

export type InvestigationListQuery = ListQuery & {
  alert_id?: string;
};

export function listInvestigations(query: InvestigationListQuery) {
  return apiFetch<PaginatedResponse<Investigation>>("/api/v1/investigations", {
    query,
  });
}

export function getInvestigation(investigationId: string) {
  return apiFetch<Investigation>(`/api/v1/investigations/${investigationId}`);
}

export function createInvestigation(payload: Partial<Investigation>) {
  return apiFetch<Investigation>("/api/v1/investigations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function patchInvestigation(
  investigationId: string,
  payload: Partial<Investigation>,
) {
  return apiFetch<Investigation>(`/api/v1/investigations/${investigationId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function triggerInvestigation(alertId: string) {
  return apiFetch<{ status: string; alert_id: string; severity: string }>(
    `/api/v1/investigations/run/${alertId}`,
    { method: "POST" },
  );
}
