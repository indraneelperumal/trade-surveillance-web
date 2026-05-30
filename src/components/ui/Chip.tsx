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
      className={cn("filter-chip", active && "filter-chip--active")}
    >
      {children}
    </button>
  );
}
