import type { Alert, Severity, Trade, AlertStatus } from "@/types/domain";

type UnknownRecord = Record<string, unknown>;

function asString(v: unknown): string {
  if (v === undefined || v === null) return "";
  return String(v);
}

function asBool(v: unknown): boolean {
  return Boolean(v);
}

function asNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function normalizeSeverity(raw: unknown): Severity {
  const s = asString(raw).toLowerCase();
  if (s === "high") return "high";
  if (s === "medium" || s === "med") return "med";
  if (s === "low") return "low";
  return "none";
}

export function normalizeStatus(raw: unknown): AlertStatus {
  const s = asString(raw).toLowerCase().replace(/-/g, "_");
  if (s === "open") return "open";
  if (s === "in_progress" || s === "inprogress") return "in-progress";
  if (s === "closed") return "closed";
  return "open";
}

export function normalizeTrade(raw: UnknownRecord): Trade {
  const tradeId = asString(raw.tradeId ?? raw.id);
  const ts = raw.timestamp ?? raw.tradedAt;
  const tradedAt =
    typeof ts === "string"
      ? ts
      : ts instanceof Date
        ? ts.toISOString()
        : asString(ts);

  const sideRaw = asString(raw.side).toUpperCase();
  const side = sideRaw === "SELL" ? "SELL" : "BUY";

  return {
    id: tradeId || asString(raw.id),
    symbol: asString(raw.symbol),
    price: Number(raw.price) || 0,
    volume: Number(raw.volume) || 0,
    side,
    tradedAt: tradedAt || new Date(0).toISOString(),
    offHours: asBool(raw.isOffHours ?? raw.offHours),
    otc: asBool(raw.isOtc ?? raw.otc),
    exchange: raw.exchange != null ? asString(raw.exchange) : undefined,
    traderId: raw.traderId != null ? asString(raw.traderId) : undefined,
    tradeValue: asNumber(raw.tradeValue),
  };
}

export function normalizeAlert(raw: UnknownRecord): Alert {
  const tid = raw.tradeId ?? raw.trade_id;
  return {
    id: asString(raw.id),
    symbol: asString(raw.symbol),
    anomalyType: asString(raw.anomalyType ?? "unknown"),
    severity: normalizeSeverity(raw.severity),
    status: normalizeStatus(raw.status),
    disposition: raw.disposition != null ? asString(raw.disposition) : null,
    assignee: raw.assignee != null ? asString(raw.assignee) : null,
    createdAt: asString(raw.createdAt),
    updatedAt: asString(raw.updatedAt),
    tradeId: tid ? asString(tid) : null,
    anomalyScore: asNumber(raw.anomalyScore),
    topShapFeature: raw.topShapFeature != null ? asString(raw.topShapFeature) : null,
    exchange: raw.exchange != null ? asString(raw.exchange) : undefined,
    traderId: raw.traderId != null ? asString(raw.traderId) : undefined,
    featureSpecVersion:
      raw.featureSpecVersion != null ? asString(raw.featureSpecVersion) : undefined,
    modelFeatures:
      raw.modelFeatures != null && typeof raw.modelFeatures === "object"
        ? (raw.modelFeatures as Record<string, unknown>)
        : undefined,
    scoringModelRunId:
      raw.scoringModelRunId != null ? asString(raw.scoringModelRunId) : undefined,
    scoredAt: raw.scoredAt != null ? asString(raw.scoredAt) : undefined,
    scoringMode: raw.scoringMode != null ? asString(raw.scoringMode) : undefined,
  };
}
