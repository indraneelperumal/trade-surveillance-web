import { ReactNode } from "react";

type TopbarProps = {
  title: string;
  badge?: string;
  actions?: ReactNode;
};

export function Topbar({ title, actions }: TopbarProps) {
  return (
    <header style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "0 20px",
      height: 52,
      borderBottom: "1px solid var(--color-border-tertiary)",
      background: "var(--color-background-primary)",
      flexShrink: 0,
    }}>
      <h1 style={{
        flex: 1,
        fontSize: 14,
        fontWeight: 600,
        margin: 0,
        color: "var(--color-text-primary)",
        letterSpacing: "0.01em",
      }}>
        {title}
      </h1>
      {actions}
    </header>
  );
}
