"use client";

import type { CSSProperties } from "react";

type InvestigationRunningAnimationProps = {
  message?: string;
  compact?: boolean;
};

/** Finance-themed loading state while the compliance agent runs. */
export function InvestigationRunningAnimation({
  message = "Agent analyzing trade patterns & regulatory context…",
  compact = false,
}: InvestigationRunningAnimationProps) {
  const heights = [38, 52, 44, 68, 48, 72, 55, 64, 42, 58, 50, 76];

  return (
    <div
      className={`investigation-running ${compact ? "investigation-running--compact" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="investigation-running__chart" aria-hidden="true">
        {heights.map((h, i) => (
          <div
            key={i}
            className={`investigation-running__candle ${i % 3 === 0 ? "investigation-running__candle--down" : ""}`}
            style={
              {
                "--candle-h": `${h}%`,
                "--candle-delay": `${i * 0.12}s`,
              } as CSSProperties
            }
          />
        ))}
        <div className="investigation-running__scan" />
        <div className="investigation-running__grid" />
      </div>
      <div className="investigation-running__meta">
        <div className="investigation-running__ticker">
          <span className="investigation-running__dot" />
          <span className="investigation-running__dot investigation-running__dot--delay" />
          <span className="investigation-running__dot investigation-running__dot--delay2" />
          <span className="investigation-running__label">LIVE ANALYSIS</span>
        </div>
        <p className="investigation-running__message">{message}</p>
        <p className="investigation-running__hint">Results will appear here automatically</p>
      </div>
    </div>
  );
}
