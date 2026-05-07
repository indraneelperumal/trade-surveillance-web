import type { Investigation } from "@/types/domain";

export function InvestigationSummary({
  investigation,
}: {
  investigation?: Investigation | null;
}) {
  if (!investigation) {
    return (
      <div className="text-[12px] text-[var(--color-text-secondary)]">
        No investigation found for this alert.
      </div>
    );
  }

  return (
    <div className="space-y-2 text-[12px]">
      {investigation.verdict ? (
        <div className="flex justify-between">
          <span className="text-[var(--color-text-secondary)]">Verdict</span>
          <span className="font-medium">{investigation.verdict}</span>
        </div>
      ) : null}
      <div className="flex justify-between">
        <span className="text-[var(--color-text-secondary)]">Confidence</span>
        <span className="font-medium">
          {investigation.confidence ?? "-"}
        </span>
      </div>
      <p className="mt-2 leading-5 text-[var(--color-text-secondary)]">
        {investigation.summary ?? "No summary added yet."}
      </p>
    </div>
  );
}
