import { apiFetch } from "@/lib/api/client";
import type { ListQuery, PaginatedResponse } from "@/types/api";
import type { ModelRun } from "@/types/domain";

export function listModelRuns(query: ListQuery) {
  return apiFetch<PaginatedResponse<ModelRun>>("/api/v1/model-runs", { query });
}
