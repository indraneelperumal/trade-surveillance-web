import type { ApiErrorEnvelope } from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | undefined | null>;
};

function withQuery(
  path: string,
  query?: Record<string, string | number | undefined | null>,
) {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) params.set(key, String(value));
  }
  const q = params.toString();
  return q.length > 0 ? `${path}?${q}` : path;
}

export class ApiError extends Error {
  code: string;
  details: unknown;
  status: number;

  constructor(message: string, code: string, status: number, details: unknown) {
    super(message);
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}) {
  const { query, headers, ...init } = options;
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${withQuery(path, query)}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
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
    let envelope: ApiErrorEnvelope | null = null;
    try {
      envelope = (await response.json()) as ApiErrorEnvelope;
    } catch {
      envelope = null;
    }

    throw new ApiError(
      envelope?.error.message ?? "Unexpected API error",
      envelope?.error.code ?? String(response.status),
      response.status,
      envelope?.error.details ?? null,
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}
