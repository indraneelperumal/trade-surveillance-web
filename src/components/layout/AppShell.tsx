import { SidebarNav } from "@/components/layout/SidebarNav";
import { Topbar } from "@/components/layout/Topbar";
import { ReactNode } from "react";

type AppShellProps = {
  title: string;
  badge?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function AppShell({ title, badge, actions, children }: AppShellProps) {
  return (
    <div className="flex h-screen min-h-[600px] bg-[var(--color-background-tertiary)]">
      <SidebarNav />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title={title} badge={badge} actions={actions} />
        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  );
}
