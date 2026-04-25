import { ReactNode } from "react";

type TopbarProps = {
  title: string;
  badge?: string;
  actions?: ReactNode;
};

export function Topbar({ title, badge, actions }: TopbarProps) {
  return (
    <header className="flex items-center gap-3 border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-5 py-3">
      <h1 className="flex-1 text-[15px] font-medium">{title}</h1>
      {badge ? (
        <span className="rounded bg-[#E6F1FB] px-2 py-[3px] text-[11px] font-medium text-[#185FA5]">
          {badge}
        </span>
      ) : null}
      {actions}
    </header>
  );
}
