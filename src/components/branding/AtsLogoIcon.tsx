type AtsLogoIconProps = {
  size?: number;
  className?: string;
};

/** Minimal mark: charcoal tile + light “A” monogram */
export function AtsLogoIcon({ size = 32, className }: AtsLogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ? `ats-logo-icon ${className}` : "ats-logo-icon"}
      aria-hidden
    >
      <rect
        className="ats-logo-bg"
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="8"
        strokeWidth="1"
      />
      <path
        className="ats-logo-fill"
        d="M16 9L22.5 23H19.2L18.1 20.2H13.9L12.8 23H9.5L16 9Z"
      />
      <path className="ats-logo-cut" d="M14.6 17.4H17.4L16 13.6L14.6 17.4Z" />
    </svg>
  );
}
