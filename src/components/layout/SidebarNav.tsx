"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { listAlerts } from "@/lib/api/endpoints/alerts";
import { queryKeys } from "@/lib/api/queryKeys";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  FileSearch,
  LayoutDashboard,
  Moon,
  Sun,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const primaryItems: NavItem[] = [
  { label: "Overview",       href: "/overview",       icon: LayoutDashboard },
  { label: "Alerts",         href: "/alerts",          icon: AlertTriangle   },
  { label: "Investigations", href: "/investigations",  icon: FileSearch      },
];

const secondaryItems: NavItem[] = [
  { label: "Users", href: "/users", icon: Users },
];

function NavLink({ item, badge }: { item: NavItem; badge?: string }) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
        transition: "background 0.12s, color 0.12s",
      }}
      className={cn(!active && "hover:!bg-[var(--sidebar-hover-bg)] hover:!text-[var(--sidebar-text-active)]")}
    >
      {active && (
        <span style={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          width: 3,
          height: 18,
          borderRadius: "0 2px 2px 0",
          background: "var(--color-accent-default)",
        }} />
      )}
      <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
      <span style={{ flex: 1 }}>{item.label}</span>
      {badge ? (
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          padding: "1px 6px",
          borderRadius: 10,
          background: "#7f1d1d",
          color: "#fca5a5",
          letterSpacing: "0.02em",
        }}>
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export function SidebarNav() {
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const openAlertsQuery = useQuery({
    queryKey: queryKeys.alerts.list({ status: "open", offset: 0, limit: 1 }),
    queryFn: () => listAlerts({ status: "open", offset: 0, limit: 1 }),
  });
  const openAlertCount = openAlertsQuery.data?.total ?? 0;

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <aside style={{
      display: "flex",
      flexDirection: "column",
      width: 210,
      flexShrink: 0,
      height: "100%",
      background: "var(--sidebar-bg)",
      borderRight: "1px solid var(--sidebar-border)",
    }}>
      {/* Brand */}
      <div style={{
        padding: "18px 22px 14px",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <div style={{
          width: 26,
          height: 26,
          borderRadius: 6,
          background: "var(--color-accent-default)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <AlertTriangle size={13} color="#fff" strokeWidth={2.5} />
        </div>
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: "var(--sidebar-text-active)",
          textTransform: "uppercase",
        }}>
          Sentinel
        </span>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--sidebar-border)", margin: "0 14px 8px" }} />

      {/* Primary nav */}
      <nav style={{ display: "flex", flexDirection: "column", flex: 1, paddingTop: 4 }}>
        {primaryItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            badge={item.href === "/alerts" && openAlertCount > 0 ? String(openAlertCount) : undefined}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div style={{ paddingBottom: 12 }}>
        <div style={{ height: 1, background: "var(--sidebar-border)", margin: "8px 14px" }} />

        {secondaryItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}

        {/* Theme toggle */}
        <button
          onClick={toggle}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "8px 14px",
            margin: "1px 0",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--sidebar-text)",
            fontSize: 13,
          }}
          className="hover:!text-[var(--sidebar-text-active)]"
        >
          {theme === "dark" ? <Sun size={15} strokeWidth={1.8} /> : <Moon size={15} strokeWidth={1.8} />}
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>

        {/* User + sign out */}
        {user?.email && (
          <div style={{ padding: "8px 14px 0" }}>
            <div style={{ fontSize: 11, color: "var(--sidebar-text)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email ?? "Signed in"}
            </div>
            <button
              onClick={handleSignOut}
              style={{
                fontSize: 11,
                color: "#ef4444",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
