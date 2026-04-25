import { apiFetch } from "@/lib/api/client";
import type { ListQuery, PaginatedResponse } from "@/types/api";
import type { User } from "@/types/domain";

export function listUsers(query: ListQuery) {
  return apiFetch<PaginatedResponse<User>>("/api/v1/users", { query });
}

export function patchUser(userId: string, payload: Partial<User>) {
  return apiFetch<User>(`/api/v1/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
