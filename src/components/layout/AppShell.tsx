import { SidebarNav } from "@/components/layout/SidebarNav";
import { Topbar } from "@/components/layout/Topbar";
import { ReactNode, Suspense } from "react";

type AppShellProps = {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
};

function SidebarFallback() {
  return (
    <aside
      className="sidebar-shell"
      style={{
        width: 210,
        flexShrink: 0,
        height: "100%",
        borderRight: "1px solid var(--sidebar-border)",
      }}
    />
  );
}

export function AppShell({ title, actions, children }: AppShellProps) {
  return (
    <div className="flex h-screen min-h-[600px] bg-[var(--sidebar-bg)]">
      <Suspense fallback={<SidebarFallback />}>
        <SidebarNav />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title={title} actions={actions} />
        <main className="app-canvas flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  );
}
