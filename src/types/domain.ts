export type Severity = "high" | "med" | "low" | "none";
export type AlertStatus = "open" | "in-progress" | "closed";

export type Trade = {
  id: string;
  symbol: string;
  price: number;
  volume: number;
  side: "BUY" | "SELL";
  tradedAt: string;
  offHours?: boolean;
  otc?: boolean;
  exchange?: string | null;
  traderId?: string | null;
  tradeValue?: number | null;
};

export type Alert = {
  id: string;
  symbol: string;
  anomalyType: string;
  severity: Severity;
  status: AlertStatus;
  disposition?: string | null;
  assignee?: string | null;
  createdAt: string;
  updatedAt: string;
  tradeId?: string | null;
  anomalyScore?: number | null;
  topShapFeature?: string | null;
  exchange?: string | null;
  traderId?: string | null;
  /** ML / scoring lineage (Phase 1 API) */
  featureSpecVersion?: string | null;
  modelFeatures?: Record<string, unknown> | null;
  scoringModelRunId?: string | null;
  scoredAt?: string | null;
  scoringMode?: string | null;
};

export type Investigation = {
  id: string;
  alertId: string;
  verdict?: string | null;
  confidence?: number | null;
  summary?: string | null;
  evidencePoints?: string[] | null;
  recommendedAction?: string | null;
  dataGaps?: string | null;
  updatedAt: string;
};

export type InvestigationNote = {
  id: string;
  alertId: string;
  investigationId?: string | null;
  authorName: string;
  noteType: "system" | "human";
  body: string;
  createdAt: string;
};

export type ModelRun = {
  id: string;
  status: "success" | "failed" | "running";
  precision?: number | null;
  recall?: number | null;
  flaggedCount?: number | null;
  totalRecords?: number | null;
  runtimeMs?: number | null;
  failureReason?: string | null;
  createdAt: string;
};

export type User = {
  id: string;
  email: string;
  role: "analyst" | "lead" | "admin";
  isActive: boolean;
  updatedAt: string;
};
