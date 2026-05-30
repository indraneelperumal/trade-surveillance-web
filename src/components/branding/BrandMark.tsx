import { AtsLogoIcon } from "@/components/branding/AtsLogoIcon";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  /** Sidebar (dark), login card (light), or compact icon-only */
  variant?: "sidebar" | "login" | "compact";
  className?: string;
};

export function BrandMark({ variant = "sidebar", className }: BrandMarkProps) {
  const isSidebar = variant === "sidebar";
  const showTagline = variant !== "compact";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <AtsLogoIcon size={isSidebar ? 28 : 32} />
      {variant !== "compact" && (
        <div className="min-w-0 leading-none">
          <div
            className={cn(
              "flex items-baseline font-bold tracking-tight",
              isSidebar ? "text-[15px] text-[var(--sidebar-text-active)]" : "text-[16px] text-[#111827]",
            )}
          >
            <span>ATS</span>
            <sup
              className={cn(
                "ml-0.5 font-normal not-italic leading-none",
                isSidebar ? "text-[10px] text-[var(--sidebar-text)]" : "text-[11px] text-[#6B7280]",
              )}
              style={{ top: "-0.35em" }}
              aria-label="registered trademark"
            >
              ®
            </sup>
          </div>
          {showTagline && (
            <p
              className={cn(
                "mt-1 max-w-[9.5rem] text-[9px] font-medium leading-[1.35] tracking-[0.02em]",
                isSidebar ? "text-[var(--sidebar-text)]" : "text-[#6B7280]",
              )}
            >
              Agentic Trade Surveillance
            </p>
          )}
        </div>
      )}
    </div>
  );
}
