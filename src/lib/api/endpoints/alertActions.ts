import { apiFetch } from "@/lib/api/client";
import type { Alert } from "@/types/domain";

export function assignAlert(alertId: string, assignedTo: string) {
  return apiFetch<Alert>(`/api/v1/alerts/${alertId}/assign`, {
    method: "POST",
    body: JSON.stringify({ assigned_to: assignedTo }),
  });
}

export function takeAlert(alertId: string) {
  return apiFetch<Alert>(`/api/v1/alerts/${alertId}/take`, { method: "POST" });
}

export function escalateAlert(alertId: string, note: string) {
  return apiFetch<Alert>(`/api/v1/alerts/${alertId}/escalate`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
}

export function closeAlert(alertId: string, disposition: string, note: string) {
  return apiFetch<Alert>(`/api/v1/alerts/${alertId}/close`, {
    method: "POST",
    body: JSON.stringify({ disposition, note }),
  });
}

export function approveInvestigation(alertId: string, overrideNote?: string) {
  return apiFetch<void>(`/api/v1/alerts/${alertId}/investigation/approve`, {
    method: "POST",
    body: JSON.stringify({ override_note: overrideNote ?? null }),
  });
}
