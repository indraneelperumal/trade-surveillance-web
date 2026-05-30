import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Clock, ShieldAlert, UserX } from "lucide-react";

type Kpi = {
  label: string;
  value: number;
  href: string;
  icon: LucideIcon;
  tone: "high" | "warn" | "info" | "neutral";
  hint: string;
};

const TONE: Record<Kpi["tone"], { border: string; icon: string; value: string }> = {
  high: {
    border: "var(--sev-high-bar)",
    icon: "var(--sev-high-text)",
    value: "var(--sev-high-text)",
  },
  warn: {
    border: "var(--sev-med-bar)",
    icon: "var(--sev-med-text)",
    value: "var(--sev-med-text)",
  },
  info: {
    border: "var(--color-accent-default)",
    icon: "var(--color-accent-default)",
    value: "var(--color-text-primary)",
  },
  neutral: {
    border: "var(--color-border-secondary)",
    icon: "var(--color-text-secondary)",
    value: "var(--color-text-primary)",
  },
};

function KpiCard({ kpi }: { kpi: Kpi }) {
  const tone = TONE[kpi.tone];
  const Icon = kpi.icon;
  const urgent = kpi.value > 0 && (kpi.tone === "high" || kpi.tone === "warn");

  return (
    <Link
      href={kpi.href}
      className="group app-surface block p-4 transition hover:border-[var(--color-border-secondary)]"
      style={{ borderLeftWidth: 3, borderLeftColor: tone.border }}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-md"
          style={{ background: "var(--color-background-secondary)", color: tone.icon }}
        >
          <Icon size={16} strokeWidth={2} />
        </div>
        {urgent ? (
          <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--sev-high-text)]">
            Action
          </span>
        ) : null}
      </div>
      <div className="mt-3 text-[11px] font-medium text-[var(--color-text-secondary)]">{kpi.label}</div>
      <div className="mt-1 text-[28px] font-bold tabular-nums leading-none" style={{ color: tone.value }}>
        {kpi.value.toLocaleString()}
      </div>
      <p className="mt-2 text-[10px] leading-snug text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]">
        {kpi.hint}
      </p>
    </Link>
  );
}

type Props = {
  openHigh: number;
  unassignedHigh: number;
  pendingOfficer: number;
  staleSla: number;
};

export function PriorityKpiGrid({ openHigh, unassignedHigh, pendingOfficer, staleSla }: Props) {
  const kpis: Kpi[] = [
    {
      label: "Open high severity",
      value: openHigh,
      href: "/queue?view=open&severity=high",
      icon: AlertTriangle,
      tone: "high",
      hint: "Critical surveillance hits needing review",
    },
    {
      label: "Unassigned high",
      value: unassignedHigh,
      href: "/queue?view=unassigned",
      icon: UserX,
      tone: openHigh > 0 ? "high" : "neutral",
      hint: "High cases with no analyst owner",
    },
    {
      label: "Pending officer",
      value: pendingOfficer,
      href: "/queue?view=officer",
      icon: ShieldAlert,
      tone: "info",
      hint: "Awaiting compliance officer decision",
    },
    {
      label: "Stale >24h",
      value: staleSla,
      href: "/queue?view=stale",
      icon: Clock,
      tone: staleSla > 0 ? "warn" : "neutral",
      hint: "Open cases breaching SLA window",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} kpi={kpi} />
      ))}
    </div>
  );
}
