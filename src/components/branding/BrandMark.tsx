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
    <div
      className={cn(
        "flex items-center gap-2.5",
        variant === "sidebar" && "brand-mark--sidebar",
        variant === "login" && "brand-mark--login",
        className,
      )}
    >
      <AtsLogoIcon size={isSidebar ? 28 : 32} />
      {variant !== "compact" && (
        <div className="min-w-0 leading-none">
          <div className="brand-mark__title">
            <span>ATS</span>
            <sup className="brand-mark__reg" aria-label="registered trademark">
              ®
            </sup>
          </div>
          {showTagline && (
            <p className="brand-mark__tagline">Agentic Trade Surveillance</p>
          )}
        </div>
      )}
    </div>
  );
}
