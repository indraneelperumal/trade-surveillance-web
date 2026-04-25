import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type ChipProps = {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
};

export function Chip({ children, active, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-[20px] border border-[var(--color-border-secondary)] bg-[var(--color-background-primary)] px-[10px] py-[3px] text-[11px] text-[var(--color-text-secondary)]",
        active && "border-[#185FA5] bg-[#185FA5] text-white",
      )}
    >
      {children}
    </button>
  );
}
