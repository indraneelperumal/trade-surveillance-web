import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[10px] border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
