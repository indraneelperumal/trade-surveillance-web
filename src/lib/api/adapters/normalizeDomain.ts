import type { Alert, AlertStatus, Severity, Trade } from "@/types/domain";
import type {
  AlertCase,
  AssigneeUser,
  CaseBundle,
  TradeCase,
} from "@/lib/api/types/case";

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
  if (s === "pending_officer_review") return "pending-officer-review";
  if (s === "closed") return "closed";
  if (s === "escalated") return "pending-officer-review";
  return "open";
}

function normalizeTimestamp(raw: unknown): string {
  if (typeof raw === "string" && raw.trim()) return raw;
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw.toISOString();
  if (typeof raw === "number" && Number.isFinite(raw)) {
    const date = new Date(raw);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return "";
}

export function normalizeTrade(raw: UnknownRecord): Trade {
  const tradeId = asString(raw.tradeId ?? raw.id);
  const tradedAt =
    normalizeTimestamp(raw.timestamp) ||
    normalizeTimestamp(raw.tradedAt) ||
    normalizeTimestamp(raw.tradeDate);

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

function parseTop3ShapFeatures(raw: unknown): Array<[string, number]> | null {
  if (!Array.isArray(raw)) return null;
  const pairs = raw
    .map((entry) => {
      if (!Array.isArray(entry) || entry.length < 2) return null;
      const name = asString(entry[0]);
      const value = Number(entry[1]);
      if (!name || !Number.isFinite(value)) return null;
      return [name, value] as [string, number];
    })
    .filter((p): p is [string, number] => p !== null);
  return pairs.length > 0 ? pairs : null;
}

export function normalizeAlert(raw: UnknownRecord): Alert {
  const tid = raw.tradeId ?? raw.trade_id;
  const top3 =
    parseTop3ShapFeatures(raw.top_3ShapFeatures) ??
    parseTop3ShapFeatures(raw.top3ShapFeatures) ??
    parseTop3ShapFeatures(raw.top_3_shap_features);
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
    top_3ShapFeatures: top3,
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

function normalizeAssigneeUser(raw: unknown): AssigneeUser | null | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const record = raw as UnknownRecord;
  const id = asString(record.id);
  if (!id) return undefined;
  return {
    id,
    email: asString(record.email),
    displayName: record.displayName != null ? asString(record.displayName) : null,
  };
}

export function normalizeTradeCase(raw: UnknownRecord): TradeCase {
  return {
    ...normalizeTrade(raw),
    spreadBps: asNumber(raw.spreadBps),
    relativeSpread: asNumber(raw.relativeSpread),
    isBlockTrade: asBool(raw.isBlockTrade),
    traderDesk: raw.traderDesk != null ? asString(raw.traderDesk) : null,
    traderRegion: raw.traderRegion != null ? asString(raw.traderRegion) : null,
    clientType: raw.clientType != null ? asString(raw.clientType) : null,
    clientMifidCategory:
      raw.clientMifidCategory != null ? asString(raw.clientMifidCategory) : null,
    counterpartyName: raw.counterpartyName != null ? asString(raw.counterpartyName) : null,
  };
}

export function normalizeCaseBundle(raw: UnknownRecord): CaseBundle {
  const alertRaw = (raw.alert ?? {}) as UnknownRecord;
  const alert: AlertCase = {
    ...normalizeAlert(alertRaw),
    ageHours: Number(alertRaw.ageHours) || 0,
    isStale: asBool(alertRaw.isStale),
    assigneeUser: normalizeAssigneeUser(alertRaw.assigneeUser),
  };

  const tradeRaw = raw.trade;
  const trade =
    tradeRaw && typeof tradeRaw === "object"
      ? normalizeTradeCase(tradeRaw as UnknownRecord)
      : null;

  return {
    alert,
    trade,
    investigation: (raw.investigation as CaseBundle["investigation"]) ?? null,
    notes: Array.isArray(raw.notes) ? (raw.notes as CaseBundle["notes"]) : [],
    permissions: (raw.permissions as CaseBundle["permissions"]) ?? {
      canAssign: false,
      canTake: false,
      canClose: false,
      canEscalate: false,
      canRunAi: false,
      canApproveInvestigation: false,
    },
  };
}
