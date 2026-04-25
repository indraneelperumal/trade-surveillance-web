import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  variant:
    | "severity-high"
    | "severity-med"
    | "severity-low"
    | "severity-none"
    | "status-open"
    | "status-prog"
    | "status-closed"
    | "note-system"
    | "note-human";
};

const map: Record<BadgeProps["variant"], string> = {
  "severity-high": "sev sev-high",
  "severity-med": "sev sev-med",
  "severity-low": "sev sev-low",
  "severity-none": "sev sev-none",
  "status-open": "status status-open",
  "status-prog": "status status-prog",
  "status-closed": "status status-closed",
  "note-system":
    "inline-flex rounded-[3px] bg-[var(--color-background-secondary)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-tertiary)]",
  "note-human":
    "inline-flex rounded-[3px] bg-[#E6F1FB] px-1.5 py-0.5 text-[10px] text-[#185FA5]",
};

export function Badge({ children, variant }: BadgeProps) {
  return <span className={cn(map[variant])}>{children}</span>;
}
