"use client";

import { Panel, PanelHead } from "@/components/ui/Panel";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/usePermissions";
import { listAlerts } from "@/lib/api/endpoints/alerts";
import { listUsers } from "@/lib/api/endpoints/users";
import { queryKeys } from "@/lib/api/queryKeys";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TeamPage() {
  const router = useRouter();
  const { hasAccessToken, isLoading: authLoading } = useAuth();
  const { isOfficer } = useRole();

  const escalationsQuery = useQuery({
    queryKey: queryKeys.alerts.list({ status: "pending_officer_review", offset: 0, limit: 30 }),
    queryFn: () => listAlerts({ status: "pending_officer_review", offset: 0, limit: 30 }),
    enabled: !authLoading && hasAccessToken && isOfficer,
  });

  const usersQuery = useQuery({
    queryKey: queryKeys.users.list({ offset: 0, limit: 50 }),
    queryFn: () => listUsers({ offset: 0, limit: 50 }),
    enabled: !authLoading && hasAccessToken && isOfficer,
  });

  if (!isOfficer) {
    return (
      <Panel>
        <PanelHead title="Team" />
        <div className="p-6 text-[12px] text-[var(--color-text-secondary)]">
          Compliance officer access only.
        </div>
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <PanelHead title="Escalations inbox" />
        {escalationsQuery.isPending ? (
          <div className="p-4 text-[12px]">Loading…</div>
        ) : escalationsQuery.data?.items.length === 0 ? (
          <div className="p-4 text-[12px] text-[var(--color-text-secondary)]">No pending escalations.</div>
        ) : (
          escalationsQuery.data?.items.map((a) => (
            <Link
              key={a.id}
              href={`/cases/${a.id}`}
              className="flex justify-between border-b border-[var(--color-border-tertiary)] px-4 py-3 text-[12px] hover:bg-[var(--color-background-secondary)]"
            >
              <span className="font-medium">{a.symbol}</span>
              <span className="text-[var(--color-text-secondary)]">{a.anomalyType}</span>
            </Link>
          ))
        )}
      </Panel>

      <Panel>
        <PanelHead title="Analysts" />
        {usersQuery.data?.items
          .filter((u) => u.role === "ANALYST")
          .map((u) => (
            <div
              key={u.id}
              className="flex justify-between border-b border-[var(--color-border-tertiary)] px-4 py-3 text-[12px]"
            >
              <span>{u.email}</span>
              <span className={u.isActive ? "text-[var(--sev-low-text)]" : "text-[#A32D2D]"}>
                {u.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
      </Panel>
    </div>
  );
}
