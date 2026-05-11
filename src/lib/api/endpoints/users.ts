import { apiFetch } from "@/lib/api/client";
import type { ListQuery, PaginatedResponse } from "@/types/api";
import type { User } from "@/types/domain";

export function listUsers(query: ListQuery) {
  return apiFetch<PaginatedResponse<User>>("/api/v1/users", { query });
}

export function getMe() {
  return apiFetch<User>("/api/v1/users/me");
}

// Request body uses snake_case — the API client does not convert request keys.
type UserUpdatePayload = {
  is_active?: boolean;
  role?: string;
};

export function patchUser(userId: string, payload: Partial<User>) {
  const body: UserUpdatePayload = {};
  if (payload.isActive !== undefined) body.is_active = payload.isActive;
  if (payload.role !== undefined) body.role = payload.role;

  return apiFetch<User>(`/api/v1/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
