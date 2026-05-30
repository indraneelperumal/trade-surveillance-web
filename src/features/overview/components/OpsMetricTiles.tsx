import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Clock, ShieldAlert, UserX } from "lucide-react";
import { Card } from "@/components/ui/Card";

type Tile = {
  label: string;
  value: number;
  href: string;
  icon: LucideIcon;
  warn?: boolean;
};

type Props = {
  unassignedHigh: number;
  pendingOfficer: number;
  staleSla: number;
};

function MiniTile({ tile }: { tile: Tile }) {
  const Icon = tile.icon;
  return (
    <Link href={tile.href} className="block h-full">
      <Card className="flex h-full flex-col p-3.5 transition hover:border-[var(--color-border-secondary)]">
        <div className="flex items-center justify-between gap-2">
          <Icon
            size={15}
            className={tile.warn ? "text-[var(--sev-high-text)]" : "text-[var(--color-text-tertiary)]"}
          />
          {tile.warn && tile.value > 0 ? (
            <span className="text-[9px] font-bold uppercase text-[var(--sev-high-text)]">!</span>
          ) : null}
        </div>
        <div className="mt-2 text-[10px] leading-snug text-[var(--color-text-secondary)]">{tile.label}</div>
        <div
          className="mt-1 text-[22px] font-bold tabular-nums leading-none"
          style={{ color: tile.warn && tile.value > 0 ? "var(--sev-high-text)" : "var(--color-text-primary)" }}
        >
          {tile.value.toLocaleString()}
        </div>
      </Card>
    </Link>
  );
}

export function OpsMetricTiles({ unassignedHigh, pendingOfficer, staleSla }: Props) {
  const tiles: Tile[] = [
    {
      label: "Unassigned high",
      value: unassignedHigh,
      href: "/queue?view=unassigned",
      icon: UserX,
      warn: true,
    },
    {
      label: "Pending officer",
      value: pendingOfficer,
      href: "/queue?view=officer",
      icon: ShieldAlert,
    },
    {
      label: "Stale >24h",
      value: staleSla,
      href: "/queue?view=stale",
      icon: Clock,
      warn: staleSla > 0,
    },
  ];

  return (
    <div className="grid h-full grid-rows-3 gap-2.5">
      {tiles.map((t) => (
        <MiniTile key={t.label} tile={t} />
      ))}
    </div>
  );
}
