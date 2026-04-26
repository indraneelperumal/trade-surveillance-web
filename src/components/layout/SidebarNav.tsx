"use client";

import { cn } from "@/lib/utils";
import { listAlerts } from "@/lib/api/endpoints/alerts";
import { queryKeys } from "@/lib/api/queryKeys";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  badge?: string;
};

const primaryItems: NavItem[] = [
  { label: "Overview", href: "/overview" },
  { label: "Alerts", href: "/alerts" },
  { label: "Investigations", href: "/investigations" },
  { label: "Model Runs", href: "/model-runs" },
];

const secondaryItems: NavItem[] = [{ label: "Users", href: "/users" }];

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] hover:text-[var(--color-text-primary)]",
        active && "bg-[var(--color-background-secondary)] font-medium text-[var(--color-text-primary)]",
      )}
    >
      {active && (
        <span className="absolute left-0 top-0 h-full w-0.5 rounded-r-sm bg-[#378ADD]" />
      )}
      <span>{item.label}</span>
      {item.badge ? (
        <span className="ml-auto rounded-[10px] bg-[#FCEBEB] px-1.5 py-0.5 text-[11px] font-medium text-[#A32D2D]">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

export function SidebarNav() {
  const openAlertsQuery = useQuery({
    queryKey: queryKeys.alerts.list({ status: "open", offset: 0, limit: 1 }),
    queryFn: () => listAlerts({ status: "open", offset: 0, limit: 1 }),
  });
  const openAlertCount = openAlertsQuery.data?.total ?? 0;
  const navItems = primaryItems.map((item) =>
    item.href === "/alerts"
      ? { ...item, badge: openAlertCount > 0 ? String(openAlertCount) : undefined }
      : item,
  );

  return (
    <aside className="flex h-full w-[200px] shrink-0 flex-col border-r border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] py-4">
      <div className="px-4 pb-5 text-[13px] font-medium tracking-[0.08em] text-[var(--color-text-secondary)] uppercase">
        Sentinel
      </div>
      <nav className="flex flex-col">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
      <div className="flex-1" />
      <nav className="flex flex-col">
        {secondaryItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
    </aside>
  );
}
