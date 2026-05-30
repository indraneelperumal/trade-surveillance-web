"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCasePermissions, useRole } from "@/hooks/usePermissions";
import {
  approveInvestigation,
  assignAlert,
  closeAlert,
  escalateAlert,
  takeAlert,
} from "@/lib/api/endpoints/alertActions";
import { InvestigationRunningAnimation } from "@/features/alerts/components/InvestigationRunningAnimation";
import { InvestigationSummary } from "@/features/alerts/components/InvestigationSummary";
import { CaseNavigator } from "@/features/cases/CaseNavigator";
import { getCase } from "@/lib/api/endpoints/cases";
import { listInvestigations, triggerInvestigation } from "@/lib/api/endpoints/investigations";
import { listUsers } from "@/lib/api/endpoints/users";
import { anomalyLabel, DISPOSITION_OPTIONS, statusLabelV2 } from "@/lib/domain/labels";
import { queryKeys } from "@/lib/api/queryKeys";
import type { InvestigationPresentation } from "@/lib/api/types/case";
import { ShapFeatureBar } from "@/features/alerts/components/ShapFeatureBar";
import {
  severityLabel,
  severityVariant,
  statusVariant,
} from "@/features/alerts/adapters/alertView";

export function CasePage({ alertId }: { alertId: string }) {
  const searchParams = useSearchParams();
  const queueContext = searchParams.toString();
  const queryClient = useQueryClient();
  const { hasAccessToken, isLoading: authLoading } = useAuth();
  const { isOfficer } = useRole();
  const [escalateNote, setEscalateNote] = useState("");
  const [closeNote, setCloseNote] = useState("");
  const [closeDisposition, setCloseDisposition] = useState("FALSE_POSITIVE");
  const [assignUserId, setAssignUserId] = useState("");
  const [awaitingInvestigation, setAwaitingInvestigation] = useState(false);
  const investigationRef = useRef<HTMLDivElement>(null);

  const caseQuery = useQuery({
    queryKey: ["cases", alertId],
    queryFn: () => getCase(alertId),
    enabled: !authLoading && hasAccessToken && Boolean(alertId),
    refetchInterval: (q) => {
      const inv = q.state.data?.investigation;
      const st = q.state.data?.alert?.status;
      if (awaitingInvestigation) return 2000;
      if (st === "in-progress" && !inv) return 2000;
      return false;
    },
  });

  const investigationsQuery = useQuery({
    queryKey: queryKeys.investigations.list({ alert_id: alertId }),
    queryFn: () => listInvestigations({ alert_id: alertId, offset: 0, limit: 1 }),
    enabled: !authLoading && hasAccessToken && Boolean(alertId),
    refetchInterval: (q) => {
      const listInv = q.state.data?.items?.[0];
      const inv = caseQuery.data?.investigation;
      const st = caseQuery.data?.alert?.status;
      if (awaitingInvestigation) return 2000;
      if (st === "in-progress" && !inv && !listInv) return 2000;
      return false;
    },
  });

  const bundle = caseQuery.data;
  const caseInvestigation = bundle?.investigation;
  const listInvestigation = investigationsQuery.data?.items?.[0];
  const hasInvestigation = Boolean(caseInvestigation ?? listInvestigation);

  useEffect(() => {
    if (hasInvestigation) {
      setAwaitingInvestigation(false);
    }
  }, [hasInvestigation, caseInvestigation?.id, listInvestigation?.id]);

  // Case bundle can lag behind investigations list — sync when list has a row first.
  useEffect(() => {
    if (listInvestigation && !caseInvestigation) {
      void queryClient.refetchQueries({ queryKey: ["cases", alertId] });
    }
  }, [listInvestigation?.id, caseInvestigation, alertId, queryClient]);

  useEffect(() => {
    if (hasInvestigation && investigationRef.current) {
      investigationRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [hasInvestigation, caseInvestigation?.id, listInvestigation?.id]);

  const usersQuery = useQuery({
    queryKey: queryKeys.users.list({ offset: 0, limit: 50 }),
    queryFn: () => listUsers({ offset: 0, limit: 50 }),
    enabled: isOfficer && hasAccessToken,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["cases", alertId] });
    queryClient.invalidateQueries({ queryKey: ["alerts"] });
    queryClient.invalidateQueries({ queryKey: ["investigations"] });
    queryClient.invalidateQueries({ queryKey: ["metrics"] });
  };

  const takeMut = useMutation({ mutationFn: () => takeAlert(alertId), onSuccess: invalidate });
  const assignMut = useMutation({
    mutationFn: () => assignAlert(alertId, assignUserId),
    onSuccess: invalidate,
  });
  const runMut = useMutation({
    mutationFn: () => triggerInvestigation(alertId),
    onMutate: () => {
      setAwaitingInvestigation(true);
    },
    onSuccess: async () => {
      invalidate();
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["cases", alertId] }),
        queryClient.refetchQueries({
          queryKey: queryKeys.investigations.list({ alert_id: alertId }),
        }),
      ]);
    },
    onError: () => {
      setAwaitingInvestigation(false);
    },
  });
  const approveMut = useMutation({
    mutationFn: () => approveInvestigation(alertId),
    onSuccess: invalidate,
  });
  const escalateMut = useMutation({
    mutationFn: () => escalateAlert(alertId, escalateNote),
    onSuccess: () => {
      setEscalateNote("");
      invalidate();
    },
  });
  const closeMut = useMutation({
    mutationFn: () => closeAlert(alertId, closeDisposition, closeNote),
    onSuccess: invalidate,
  });

  const perms = useCasePermissions(bundle?.permissions);

  if (caseQuery.isPending) {
    return <div className="p-6 text-[13px] text-[var(--color-text-secondary)]">Loading case…</div>;
  }
  if (caseQuery.isError || !bundle) {
    return (
      <div className="p-6 text-[13px] text-[#A32D2D]">
        Case unavailable. <Link href="/queue">Back to queue</Link>
      </div>
    );
  }

  const { alert, trade, notes } = bundle;
  const isAgentRunning =
    !hasInvestigation &&
    (awaitingInvestigation ||
      runMut.isPending ||
      alert.status === "in-progress");

  return (
    <div className="flex flex-col gap-4">
      {queueContext ? <CaseNavigator alertId={alertId} queueContext={queueContext} /> : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/queue" className="text-[11px] text-[var(--color-text-secondary)] hover:underline">
            ← Queue
          </Link>
          <h1 className="mt-1 text-[20px] font-bold">{alert.symbol}</h1>
          <p className="mono text-[11px] text-[var(--color-text-tertiary)]">{alert.id}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
            <span className={`sev sev-${alert.severity === "med" ? "med" : alert.severity}`}>
              {severityLabel(alert.severity)}
            </span>
            <span className={`status ${statusVariant(alert.status)}`}>
              {statusLabelV2(alert.status)}
            </span>
            <span className="rounded border border-[var(--color-border-tertiary)] px-2 py-0.5 capitalize">
              {anomalyLabel(alert.anomalyType)}
            </span>
            {alert.isStale && (
              <span className="rounded bg-[#FFF8E6] px-2 py-0.5 text-[#7D5A00]">Stale &gt;24h</span>
            )}
          </div>
        </div>
        <div className="text-right text-[12px] text-[var(--color-text-secondary)]">
          <div>Assignee: {alert.assigneeUser?.email ?? alert.assignee ?? "Unassigned"}</div>
          <div>Age: {alert.ageHours?.toFixed(1)}h</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Left — trade + ML */}
        <div className="space-y-4 rounded-lg border border-[var(--color-border-tertiary)] p-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-tertiary)]">
            Trade &amp; market context
          </h2>
          {trade ? (
            <dl className="space-y-2 text-[12px]">
              <Row label="Time" value={new Date(trade.tradedAt).toLocaleString()} />
              <Row label="Side / price" value={`${trade.side} @ ${trade.price}`} />
              <Row label="Volume" value={String(trade.volume)} />
              {trade.tradeValue != null && <Row label="Notional" value={`$${trade.tradeValue.toLocaleString()}`} />}
              {trade.offHours && <Row label="Off-hours" value="Yes" />}
              {trade.otc && <Row label="OTC" value="Yes" />}
              {trade.traderId && <Row label="Trader" value={trade.traderId} />}
              {trade.traderDesk && <Row label="Desk" value={trade.traderDesk} />}
              {trade.clientType && <Row label="Client type" value={trade.clientType} />}
              {trade.counterpartyName && <Row label="Counterparty" value={trade.counterpartyName} />}
            </dl>
          ) : (
            <p className="text-[12px] text-[var(--color-text-secondary)]">Trade data unavailable.</p>
          )}
          <h3 className="pt-2 text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-tertiary)]">
            ML signal
          </h3>
          {alert.top_3ShapFeatures?.length ? (
            <ShapFeatureBar features={alert.top_3ShapFeatures} anomalyScore={alert.anomalyScore} />
          ) : (
            <p className="text-[12px] text-[var(--color-text-secondary)]">
              Explainability unavailable — use anomaly type and trade context.
            </p>
          )}
        </div>

        {/* Center — investigation */}
        <div
          ref={investigationRef}
          className="space-y-4 rounded-lg border border-[var(--color-border-tertiary)] p-4 xl:col-span-1"
        >
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-tertiary)]">
            AI investigation
          </h2>
          {isAgentRunning && (
            <InvestigationRunningAnimation message="Compliance agent reviewing trade, ML signals, and US regulatory rules…" />
          )}
          {!hasInvestigation && perms.canRunAi && !isAgentRunning && (
            <button
              type="button"
              className="btn w-full"
              disabled={runMut.isPending}
              onClick={() => runMut.mutate()}
            >
              Run AI investigation
            </button>
          )}
          {caseInvestigation && (
            <InvestigationPanel
              investigation={caseInvestigation}
              canApprove={perms.canApproveInvestigation}
              onApprove={() => approveMut.mutate()}
              approving={approveMut.isPending}
            />
          )}
          {!caseInvestigation && listInvestigation && (
            <InvestigationSummary investigation={listInvestigation} />
          )}
          {hasInvestigation && (
            <Link
              href="/investigations"
              className="block text-center text-[11px] text-[var(--color-accent-default)] hover:underline"
            >
              Also listed under Investigations →
            </Link>
          )}
        </div>

        {/* Right — workflow */}
        <div className="space-y-4 rounded-lg border border-[var(--color-border-tertiary)] p-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-tertiary)]">
            Workflow
          </h2>
          {perms.canTake && alert.status !== "closed" && (
            <button type="button" className="btn w-full" onClick={() => takeMut.mutate()}>
              Take case
            </button>
          )}
          {perms.canAssign && (
            <div className="space-y-2">
              <select
                className="w-full rounded border border-[var(--color-border-secondary)] bg-[var(--color-background-primary)] px-2 py-1.5 text-[12px]"
                value={assignUserId}
                onChange={(e) => setAssignUserId(e.target.value)}
              >
                <option value="">Assign to analyst…</option>
                {usersQuery.data?.items
                  .filter((u) => u.role === "ANALYST" && u.isActive)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.email}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                className="btn w-full"
                disabled={!assignUserId || assignMut.isPending}
                onClick={() => assignMut.mutate()}
              >
                Assign
              </button>
            </div>
          )}
          {perms.canEscalate && (
            <div className="space-y-2 border-t border-[var(--color-border-tertiary)] pt-3">
              <label className="text-[11px] text-[var(--color-text-secondary)]">Escalate to officer</label>
              <textarea
                className="w-full rounded border border-[var(--color-border-secondary)] bg-[var(--color-background-primary)] p-2 text-[12px]"
                rows={2}
                value={escalateNote}
                onChange={(e) => setEscalateNote(e.target.value)}
                placeholder="Reason for escalation (min 3 chars)"
              />
              <button
                type="button"
                className="btn w-full"
                disabled={escalateNote.length < 3 || escalateMut.isPending}
                onClick={() => escalateMut.mutate()}
              >
                Escalate
              </button>
            </div>
          )}
          {perms.canClose && (
            <div className="space-y-2 border-t border-[var(--color-border-tertiary)] pt-3">
              <label className="text-[11px] text-[var(--color-text-secondary)]">Close case (officer)</label>
              <select
                className="w-full rounded border border-[var(--color-border-secondary)] bg-[var(--color-background-primary)] px-2 py-1.5 text-[12px]"
                value={closeDisposition}
                onChange={(e) => setCloseDisposition(e.target.value)}
              >
                {DISPOSITION_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
              <textarea
                className="w-full rounded border border-[var(--color-border-secondary)] bg-[var(--color-background-primary)] p-2 text-[12px]"
                rows={2}
                value={closeNote}
                onChange={(e) => setCloseNote(e.target.value)}
                placeholder="Closing note (min 3 chars)"
              />
              <button
                type="button"
                className="btn w-full"
                disabled={closeNote.length < 3 || closeMut.isPending}
                onClick={() => closeMut.mutate()}
              >
                Close with disposition
              </button>
            </div>
          )}

          <h3 className="pt-2 text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-tertiary)]">
            Activity
          </h3>
          <ul className="max-h-48 space-y-2 overflow-y-auto text-[12px]">
            {notes.length === 0 ? (
              <li className="text-[var(--color-text-secondary)]">No activity yet.</li>
            ) : (
              notes.map((n) => (
                <li key={n.id} className="border-b border-[var(--color-border-tertiary)] pb-2">
                  <div className="text-[10px] text-[var(--color-text-tertiary)]">
                    {n.noteType} · {new Date(n.createdAt).toLocaleString()}
                  </div>
                  <div>{n.content}</div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-[var(--color-text-secondary)]">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function InvestigationPanel({
  investigation,
  canApprove,
  onApprove,
  approving,
}: {
  investigation: InvestigationPresentation;
  canApprove: boolean;
  onApprove: () => void;
  approving: boolean;
}) {
  const h = investigation.headline;
  const isDismiss = h.verdict === "DISMISS";

  return (
    <div className="space-y-3 text-[12px]">
      <div className="rounded border border-[var(--color-border-secondary)] p-3">
        <div className="font-semibold">{h.verdictLabel}</div>
        {h.verdictHint && (
          <p className="mt-1 text-[var(--color-text-secondary)]">{h.verdictHint}</p>
        )}
        {isDismiss && (
          <p className="callout-warning mt-2 px-2 py-1 text-[11px]">
            AI suggests dismiss — this is not a final disposition. Officer must close the case.
          </p>
        )}
        {h.confidenceLabel && (
          <p className="mt-1 text-[10px] text-[var(--color-text-tertiary)]">{h.confidenceLabel}</p>
        )}
      </div>

      {investigation.reviewStatus === "AI_COMPLETE" && canApprove && (
        <button type="button" className="btn w-full" disabled={approving} onClick={onApprove}>
          Approve AI findings
        </button>
      )}
      {investigation.reviewStatus !== "AI_COMPLETE" && (
        <p className="text-[11px] text-[var(--sev-low-text)]">✓ Findings approved</p>
      )}

      {investigation.sections.map((sec) => (
        <div
          key={sec.id}
          className={
            sec.emphasis === "warning"
              ? "callout-warning"
              : "rounded border border-[var(--color-border-tertiary)] p-3"
          }
        >
          <div
            className={`mb-1 text-[10px] font-bold uppercase ${
              sec.emphasis === "warning"
                ? "callout-warning__label"
                : "text-[var(--color-text-tertiary)]"
            }`}
          >
            {sec.title}
          </div>
          {sec.body && <p className="leading-5">{sec.body}</p>}
          {sec.bullets?.map((b, i) => (
            <p
              key={i}
              className={`mt-1 leading-5 ${
                sec.emphasis === "warning" ? "" : "text-[var(--color-text-secondary)]"
              }`}
            >
              • {b}
            </p>
          ))}
          {sec.items?.map((item) => (
            <p key={item.ruleCode} className="mt-1 text-[11px]">
              <span className="font-mono">{item.label}</span>
              {item.detail ? ` — ${item.detail}` : ""}
            </p>
          ))}
        </div>
      ))}
      {investigation.error && (
        <p className="text-[#A32D2D]">{investigation.error}</p>
      )}
    </div>
  );
}
