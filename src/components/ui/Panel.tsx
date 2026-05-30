import { cn } from "@/lib/utils";
import { forwardRef, ReactNode } from "react";

export const Panel = forwardRef<HTMLElement, { children: ReactNode; className?: string }>(
  function Panel({ children, className }, ref) {
    return (
      <section
        ref={ref}
        className={cn(
          "overflow-hidden rounded-[10px] border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)]",
          className,
        )}
      >
        {children}
      </section>
    );
  },
);

export function PanelHead({
  title,
  right,
}: {
  title: string;
  right?: ReactNode;
}) {
  return (
    <header className="flex items-center gap-2 border-b border-[var(--color-border-tertiary)] px-4 py-3">
      <h2 className="flex-1 text-[13px] font-medium">{title}</h2>
      {right}
    </header>
  );
}
