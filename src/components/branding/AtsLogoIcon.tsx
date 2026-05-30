type AtsLogoIconProps = {
  size?: number;
  className?: string;
};

/** MVP mark: candlesticks + surveillance scan arc + agent node */
export function AtsLogoIcon({ size = 32, className }: AtsLogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="ats-logo-bg" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#185FA5" />
          <stop offset="1" stopColor="#0D9488" />
        </linearGradient>
        <linearGradient id="ats-logo-scan" x1="4" y1="26" x2="28" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#93C5FD" stopOpacity="0.2" />
          <stop offset="0.5" stopColor="#E0F2FE" stopOpacity="0.95" />
          <stop offset="1" stopColor="#5EEAD4" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="url(#ats-logo-bg)" />
      <path
        d="M5 25.5Q16 17.5 27 25.5"
        stroke="url(#ats-logo-scan)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <g stroke="#F8FAFC" strokeWidth="1.15" strokeLinecap="round" opacity="0.92">
        <line x1="8" y1="10" x2="8" y2="22" />
        <line x1="16" y1="8.5" x2="16" y2="23.5" />
        <line x1="24" y1="11" x2="24" y2="22" />
      </g>
      <rect x="6.4" y="14.2" width="3.2" height="5.2" rx="0.6" fill="#34D399" />
      <rect x="14.4" y="16.4" width="3.2" height="6.4" rx="0.6" fill="#F87171" />
      <rect x="22.4" y="13.6" width="3.2" height="4.4" rx="0.6" fill="#34D399" />
      <circle cx="25.5" cy="7.5" r="3" fill="#FCD34D" opacity="0.95" />
      <circle cx="25.5" cy="7.5" r="1.15" fill="#0F172A" />
      <circle cx="26.1" cy="6.9" r="0.35" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}
