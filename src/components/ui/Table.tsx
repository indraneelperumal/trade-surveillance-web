import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function Table({ children }: { children: ReactNode }) {
  return <table className="w-full border-collapse text-[12px]">{children}</table>;
}

export function Th({ children }: { children: ReactNode }) {
  return (
    <th className="border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-3 py-2 text-left text-[11px] font-medium tracking-[0.05em] text-[var(--color-text-secondary)] uppercase">
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "border-b border-[var(--color-border-tertiary)] px-3 py-2.5 align-middle",
        className,
      )}
    >
      {children}
    </td>
  );
}
