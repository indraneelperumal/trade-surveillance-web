import { apiFetch } from "@/lib/api/client";
import type { CaseBundle } from "@/lib/api/types/case";

export function getCase(alertId: string) {
  return apiFetch<CaseBundle>(`/api/v1/cases/${alertId}`);
}
