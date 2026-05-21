export type Severity = "high" | "med" | "low" | "none";
export type AlertStatus = "open" | "in-progress" | "pending-officer-review" | "closed" | "escalated";

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
  /** [[feature_name, shap_value], ...] — top 3 features by |SHAP| from IsolationForest */
  top_3ShapFeatures?: Array<[string, number]> | null;
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
  confidence?: string | null;
  ruleViolated?: string | null;
  summary?: string | null;
  evidencePoints?: string[] | null;
  recommendedAction?: string | null;
  dataGaps?: string | null;
  modelVersion?: string | null;
  errorMessage?: string | null;
  isAuto?: boolean | null;
  startedAt?: string | null;
  createdAt?: string | null;
  updatedAt: string;
};

export type InvestigationNote = {
  id: string;
  alertId: string;
  investigationId?: string | null;
  // API returns author_id (UUID) → camelized authorId; no authorName field
  authorId?: string | null;
  noteType: "system" | "human";
  isSystem?: boolean;
  // API field is "content" (not "body")
  content: string;
  createdAt: string;
};

export type ModelRun = {
  id: string;
  // API values: "COMPLETED" | "STARTED" | "FAILED"
  status: string;
  modelName?: string | null;
  runType?: string | null;
  precision?: number | null;
  recall?: number | null;
  flaggedCount?: number | null;
  totalRecords?: number | null;
  // API field is runtimeSeconds (not runtimeMs)
  runtimeSeconds?: number | null;
  // API field is errorMessage (not failureReason)
  errorMessage?: string | null;
  startedAt?: string | null;
  createdAt: string;
};

export type User = {
  id: string;
  email: string;
  // API returns "ANALYST" | "COMPLIANCE_LEAD" (uppercase, as stored in DB)
  role: string;
  isActive: boolean;
  updatedAt: string;
};
