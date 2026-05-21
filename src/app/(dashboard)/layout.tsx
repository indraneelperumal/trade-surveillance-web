import { AuthGate } from "@/components/auth/AuthGate";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardFrame>
      <AuthGate>{children}</AuthGate>
    </DashboardFrame>
  );
}
