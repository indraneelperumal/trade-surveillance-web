import type { Alert, InvestigationNote, Trade } from "@/types/domain";

export type AssigneeUser = {
  id: string;
  email: string;
  displayName?: string | null;
};

export type AlertCase = Alert & {
  assigneeUser?: AssigneeUser | null;
  ageHours: number;
  isStale: boolean;
};

export type TradeCase = Trade & {
  spreadBps?: number | null;
  relativeSpread?: number | null;
  isBlockTrade?: boolean;
  traderDesk?: string | null;
  traderRegion?: string | null;
  clientType?: string | null;
  clientMifidCategory?: string | null;
  counterpartyName?: string | null;
};

export type InvestigationRuleItem = {
  ruleCode: string;
  label: string;
  status: string;
  detail?: string | null;
};

export type InvestigationSection = {
  id: string;
  title: string;
  body?: string | null;
  bullets?: string[] | null;
  items?: InvestigationRuleItem[] | null;
  emphasis?: string;
};

export type InvestigationHeadline = {
  verdict: string;
  verdictLabel: string;
  verdictHint?: string | null;
  confidence?: string | null;
  confidenceLabel?: string | null;
  modelVersion?: string | null;
  completedAt?: string | null;
};

export type InvestigationPresentation = {
  id: string;
  alertId: string;
  reviewStatus: string;
  headline: InvestigationHeadline;
  sections: InvestigationSection[];
  error?: string | null;
};

export type CasePermissions = {
  canAssign: boolean;
  canTake: boolean;
  canClose: boolean;
  canEscalate: boolean;
  canRunAi: boolean;
  canApproveInvestigation: boolean;
};

export type CaseBundle = {
  alert: AlertCase;
  trade: TradeCase | null;
  investigation: InvestigationPresentation | null;
  notes: InvestigationNote[];
  permissions: CasePermissions;
};
