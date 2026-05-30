"use client";

import { BrandMark } from "@/components/branding/BrandMark";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/usePermissions";
import { useTheme } from "@/hooks/useTheme";
import { listAlerts } from "@/lib/api/endpoints/alerts";
import { getOverviewMetrics } from "@/lib/api/endpoints/metrics";
import { queryKeys } from "@/lib/api/queryKeys";
import { roleLabel } from "@/lib/domain/labels";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  FileSearch,
  LayoutDashboard,
  ListOrdered,
  Moon,
  Sun,
  Users,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parseCaseReturnOrigin } from "@/lib/navigation/caseReturn";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  officerOnly?: boolean;
};

const primaryItems: NavItem[] = [
  { label: "Queue", href: "/queue", icon: ListOrdered },
  { label: "Overview", href: "/overview", icon: LayoutDashboard },
  { label: "Team", href: "/team", icon: UserCog, officerOnly: true },
  { label: "Investigations", href: "/investigations", icon: FileSearch },
];

const secondaryItems: NavItem[] = [
  { label: "Users", href: "/users", icon: Users, officerOnly: true },
];

function NavLink({ item, badge }: { item: NavItem; badge?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const active =
    pathname.startsWith("/cases/")
      ? parseCaseReturnOrigin(from) === "investigations"
        ? item.href === "/investigations"
        : parseCaseReturnOrigin(from) === "alerts"
          ? item.href === "/alerts"
          : item.href === "/queue"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 14px",
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        color: active ? "var(--sidebar-text-active)" : "var(--sidebar-text)",
        background: active ? "var(--sidebar-active-bg)" : "transparent",
        borderRadius: 6,
        margin: "1px 8px",
        textDecoration: "none",
      }}
      className={cn(!active && "hover:!bg-[var(--sidebar-hover-bg)] hover:!text-[var(--sidebar-text-active)]")}
    >
      {active && (
        <span
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: 3,
            height: 18,
            borderRadius: "0 2px 2px 0",
            background: "var(--color-accent-default)",
          }}
        />
      )}
      <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
      <span style={{ flex: 1 }}>{item.label}</span>
      {badge ? (
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: "1px 6px",
            borderRadius: 10,
            background: "#7f1d1d",
            color: "#fca5a5",
          }}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export function SidebarNav() {
  const { theme, toggle } = useTheme();
  const { user, signOut, isLoading: authLoading, hasAccessToken } = useAuth();
  const { isOfficer } = useRole();
  const router = useRouter();

  const metricsQuery = useQuery({
    queryKey: queryKeys.metrics.overview(),
    queryFn: () => getOverviewMetrics(),
    enabled: hasAccessToken,
  });

  const highBadge = String(metricsQuery.data?.openHighSeverityCount ?? 0);

  const visiblePrimary = primaryItems.filter((i) => !i.officerOnly || isOfficer);
  const visibleSecondary = secondaryItems.filter((i) => !i.officerOnly || isOfficer);

  return (
    <aside
      className="sidebar-shell"
      style={{
        display: "flex",
        flexDirection: "column",
        width: 210,
        flexShrink: 0,
        height: "100%",
        borderRight: "1px solid var(--sidebar-border)",
      }}
    >
      <div style={{ padding: "16px 18px 12px" }}>
        <BrandMark variant="sidebar" />
      </div>

      <div style={{ height: 1, background: "var(--sidebar-border)", margin: "0 14px 8px" }} />

      <nav style={{ display: "flex", flexDirection: "column", flex: 1, paddingTop: 4 }}>
        {visiblePrimary.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            badge={item.href === "/queue" && Number(highBadge) > 0 ? highBadge : undefined}
          />
        ))}
      </nav>

      <div style={{ paddingBottom: 12 }}>
        <div style={{ height: 1, background: "var(--sidebar-border)", margin: "8px 14px" }} />
        {visibleSecondary.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
        <button
          type="button"
          onClick={toggle}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "8px 14px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--sidebar-text)",
            fontSize: 13,
          }}
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
        {!authLoading && (
          <div style={{ padding: "8px 14px 0" }}>
            {user?.email ? (
              <>
                <div style={{ fontSize: 10, color: "var(--sidebar-text)", marginBottom: 4 }}>
                  {roleLabel(user.role ?? "ANALYST")}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--sidebar-text)",
                    marginBottom: 6,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.email}
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  style={{
                    fontSize: 11,
                    color: "#ef4444",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => router.replace("/login")}
                style={{ fontSize: 11, color: "var(--sidebar-text)", background: "none", border: "none", cursor: "pointer" }}
              >
                Sign in
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
