export type CaseReturnOrigin = "queue" | "investigations" | "alerts";

const QUEUE_CONTEXT_KEYS = ["view", "q", "severity", "status", "anomalyType", "symbol", "offset"] as const;

export function parseCaseReturnOrigin(from: string | null): CaseReturnOrigin {
  if (from === "investigations") return "investigations";
  if (from === "alerts") return "alerts";
  return "queue";
}

export function buildQueueContext(params: URLSearchParams): string {
  const out = new URLSearchParams();
  for (const key of QUEUE_CONTEXT_KEYS) {
    const value = params.get(key);
    if (value) out.set(key, value);
  }
  return out.toString();
}

export function caseBackLink(searchParams: URLSearchParams): { href: string; label: string } {
  const origin = parseCaseReturnOrigin(searchParams.get("from"));
  if (origin === "investigations") {
    return { href: "/investigations", label: "Investigations" };
  }
  if (origin === "alerts") {
    return { href: "/alerts", label: "Alerts" };
  }
  const queueContext = buildQueueContext(searchParams);
  return {
    href: queueContext ? `/queue?${queueContext}` : "/queue",
    label: "Queue",
  };
}

export function caseDetailHref(
  alertId: string,
  origin: CaseReturnOrigin,
  searchParams?: URLSearchParams,
): string {
  const params = new URLSearchParams();
  params.set("from", origin);
  if (origin === "queue" && searchParams) {
    const queueContext = buildQueueContext(searchParams);
    for (const [key, value] of new URLSearchParams(queueContext)) {
      params.set(key, value);
    }
  }
  const query = params.toString();
  return query ? `/cases/${alertId}?${query}` : `/cases/${alertId}?from=${origin}`;
}

export function caseNavigationQuery(queueContext: string): string {
  const params = new URLSearchParams({ from: "queue" });
  for (const [key, value] of new URLSearchParams(queueContext)) {
    params.set(key, value);
  }
  return params.toString();
}
