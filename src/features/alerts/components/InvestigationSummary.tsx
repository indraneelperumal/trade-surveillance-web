import type { Investigation } from "@/types/domain";

function verdictStyle(verdict: string | null | undefined) {
  switch (verdict?.toUpperCase()) {
    case "ESCALATE":
      return { bg: "#FDECEC", color: "#A32D2D", border: "#F4C7C7" };
    case "MONITOR":
      return { bg: "#FFF8E6", color: "#7D5A00", border: "#FFE8A3" };
    case "DISMISS":
      return { bg: "#EDFAF3", color: "#1A6640", border: "#B3E8CC" };
    default:
      return { bg: "var(--color-background-secondary)", color: "var(--color-text-secondary)", border: "var(--color-border-secondary)" };
  }
}

function Pill({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.04em",
        border: "1px solid var(--color-border-secondary)",
        background: "var(--color-background-secondary)",
        color: "var(--color-text-secondary)",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-semibold tracking-[0.06em] uppercase text-[var(--color-text-secondary)]">
        {label}
      </div>
      {children}
    </div>
  );
}

export function InvestigationSummary({
  investigation,
}: {
  investigation?: Investigation | null;
}) {
  if (!investigation) {
    return (
      <div className="text-[12px] text-[var(--color-text-secondary)]">
        No investigation yet. Click "Run investigation" to start.
      </div>
    );
  }

  const vs = verdictStyle(investigation.verdict);
  const isError = Boolean(investigation.errorMessage);
  const rules = investigation.ruleViolated
    ? investigation.ruleViolated
        .split(";")
        .map((r) => r.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="space-y-4 text-[12px]">

      {/* Verdict row */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          style={{
            padding: "3px 10px",
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 700,
            background: vs.bg,
            color: vs.color,
            border: `1px solid ${vs.border}`,
          }}
        >
          {investigation.verdict ?? "UNKNOWN"}
        </span>
        {investigation.confidence ? (
          <Pill>{investigation.confidence} confidence</Pill>
        ) : null}
        {investigation.modelVersion && !isError ? (
          <Pill style={{ fontFamily: "monospace", fontSize: 10 }}>
            {investigation.modelVersion}
          </Pill>
        ) : null}
        {isError ? (
          <Pill style={{ background: "#FDECEC", color: "#A32D2D", border: "#F4C7C7" }}>
            Agent error
          </Pill>
        ) : null}
      </div>

      {/* Error message */}
      {isError && (
        <div className="rounded-[6px] border border-[#F4C7C7] bg-[#FDECEC] px-3 py-2 text-[11px] text-[#A32D2D]">
          {investigation.errorMessage}
        </div>
      )}

      {/* Rules violated */}
      {rules.length > 0 && (
        <Section label="Rule violated">
          <div className="flex flex-wrap gap-1.5">
            {rules.map((rule, i) => {
              const name = rule.split("(")[0].trim();
              return (
                <Pill key={i} style={{ fontFamily: "monospace" }}>
                  {name}
                </Pill>
              );
            })}
          </div>
        </Section>
      )}

      {/* Summary */}
      {investigation.summary && (
        <Section label="Summary">
          <p className="leading-5 text-[var(--color-text-primary)]">
            {investigation.summary}
          </p>
        </Section>
      )}

      {/* Evidence points */}
      {investigation.evidencePoints && investigation.evidencePoints.length > 0 && (
        <Section label={`Evidence · ${investigation.evidencePoints.length} points`}>
          <ol className="space-y-2">
            {investigation.evidencePoints.map((point, i) => (
              <li key={i} className="flex gap-2.5">
                <span
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] font-semibold"
                  style={{
                    borderColor: "var(--color-border-secondary)",
                    color: "var(--color-text-secondary)",
                    background: "var(--color-background-secondary)",
                  }}
                >
                  {i + 1}
                </span>
                <span className="leading-5 text-[var(--color-text-secondary)]">{point}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Recommended action */}
      {investigation.recommendedAction && (
        <Section label="Recommended action">
          <p className="leading-5 text-[var(--color-text-secondary)]">
            {investigation.recommendedAction}
          </p>
        </Section>
      )}

      {/* Data gaps */}
      {investigation.dataGaps && (
        <Section label="Data gaps flagged">
          <div className="callout-warning text-[12px] leading-5">{investigation.dataGaps}</div>
        </Section>
      )}

    </div>
  );
}
