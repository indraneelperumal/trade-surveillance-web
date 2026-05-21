import { ApiError } from "@/lib/api/client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export type AuthTokenPayload = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: { id: string; email: string };
};

function toCamelCaseKey(key: string) {
  return key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

function camelizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => camelizeValue(item));
  }
  if (value && typeof value === "object" && value.constructor === Object) {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
      (acc, [key, nestedValue]) => {
        acc[toCamelCaseKey(key)] = camelizeValue(nestedValue);
        return acc;
      },
      {},
    );
  }
  return value;
}

async function authPost<T>(path: string, body: Record<string, string>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (error) {
    throw new ApiError(
      "Unable to reach backend API. Check NEXT_PUBLIC_API_BASE_URL and backend server status.",
      "NETWORK_ERROR",
      0,
      error,
    );
  }

  if (!response.ok) {
    let message = "Sign in failed";
    try {
      const envelope = (await response.json()) as { error?: { message?: string } };
      message = envelope?.error?.message ?? message;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(message, String(response.status), response.status, null);
  }

  const data = await response.json();
  return camelizeValue(data) as T;
}

export function login(email: string, password: string) {
  return authPost<AuthTokenPayload>("/api/v1/auth/login", { email, password });
}

export function refreshAuth(refreshToken: string) {
  return authPost<AuthTokenPayload>("/api/v1/auth/refresh", { refresh_token: refreshToken });
}
