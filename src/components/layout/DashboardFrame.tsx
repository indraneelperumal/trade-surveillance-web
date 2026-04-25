"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

const topbarByPath: Record<string, { title: string; badge?: string }> = {
  "/overview": { title: "Overview" },
  "/alerts": { title: "Alerts", badge: "Open queue" },
  "/investigations": { title: "Investigations" },
  "/model-runs": { title: "Model Runs" },
  "/users": { title: "Users" },
};

export function DashboardFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const key = Object.keys(topbarByPath).find((candidate) =>
    pathname.startsWith(candidate),
  );
  const topbar = (key && topbarByPath[key]) || { title: "Sentinel" };

  return (
    <AppShell
      title={topbar.title}
      badge={topbar.badge}
      actions={
        <Button variant="primary" type="button">
          New Investigation
        </Button>
      }
    >
      {children}
    </AppShell>
  );
}
