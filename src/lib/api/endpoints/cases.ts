import { normalizeCaseBundle } from "@/lib/api/adapters/normalizeDomain";
import { apiFetch } from "@/lib/api/client";
import type { CaseBundle } from "@/lib/api/types/case";

export function getCase(alertId: string) {
  return apiFetch<Record<string, unknown>>(`/api/v1/cases/${alertId}`).then(
    normalizeCaseBundle,
  ) as Promise<CaseBundle>;
}
