"use client";

import { Button } from "@/components/ui/Button";
import { Panel, PanelHead } from "@/components/ui/Panel";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/usePermissions";
import { patchUser } from "@/lib/api/endpoints/users";
import { queryKeys } from "@/lib/api/queryKeys";
import { listUsers } from "@/lib/api/endpoints/users";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { hasAccessToken, isLoading: authLoading } = useAuth();
  const { isOfficer } = useRole();

  const usersQuery = useQuery({
    queryKey: queryKeys.users.list({ offset: 0, limit: 50 }),
    queryFn: () => listUsers({ offset: 0, limit: 50 }),
    enabled: !authLoading && hasAccessToken && isOfficer,
  });

  const mutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      patchUser(userId, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  if (!isOfficer) {
    return (
      <Panel>
        <PanelHead title="Users" />
        <div className="p-6 text-[12px] text-[var(--color-text-secondary)]">
          Compliance officer access only.
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHead title="Users" />
      {usersQuery.isPending ? (
        <div className="p-6 text-[12px] text-[var(--color-text-secondary)]">
          Loading users...
        </div>
      ) : usersQuery.isError ? (
        <div className="p-6 text-[12px] text-[#A32D2D]">
          Failed to load users from the backend.
        </div>
      ) : usersQuery.data?.items.length ? (
        usersQuery.data.items.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between border-b border-[var(--color-border-tertiary)] px-4 py-3 text-[13px] last:border-b-0"
          >
            <div>
              <div className="font-medium">{user.email}</div>
              <div className="text-[12px] text-[var(--color-text-secondary)]">
                {user.role} · {user.isActive ? "active" : "inactive"}
              </div>
            </div>
            <Button
              onClick={() => mutation.mutate({ userId: user.id, isActive: !user.isActive })}
            >
              Set {user.isActive ? "inactive" : "active"}
            </Button>
          </div>
        ))
      ) : (
        <div className="p-6 text-[12px] text-[var(--color-text-secondary)]">
          No users available.
        </div>
      )}
    </Panel>
  );
}
