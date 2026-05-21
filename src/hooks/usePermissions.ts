"use client";

import { useAuth } from "@/contexts/AuthContext";
import { isOfficer } from "@/lib/domain/labels";
import type { CasePermissions } from "@/lib/api/types/case";

export function useRole() {
  const { user } = useAuth();
  const role = user?.role ?? "ANALYST";
  return {
    role,
    isOfficer: isOfficer(role),
    isAnalyst: !isOfficer(role),
    displayName: user?.displayName ?? user?.email ?? "",
  };
}

export function useCasePermissions(casePermissions?: CasePermissions | null) {
  const { isOfficer: officer } = useRole();
  return {
    canAssign: casePermissions?.canAssign ?? officer,
    canTake: casePermissions?.canTake ?? true,
    canClose: casePermissions?.canClose ?? officer,
    canEscalate: casePermissions?.canEscalate ?? false,
    canRunAi: casePermissions?.canRunAi ?? false,
    canApproveInvestigation: casePermissions?.canApproveInvestigation ?? false,
  };
}
