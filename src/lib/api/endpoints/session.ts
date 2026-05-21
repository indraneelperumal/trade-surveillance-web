import { apiFetch } from "@/lib/api/client";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  displayName?: string | null;
};

export function getAuthSession() {
  return apiFetch<{ user: AuthUser }>("/api/v1/auth/session");
}
