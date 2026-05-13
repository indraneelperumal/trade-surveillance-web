type ShapEntry = [string, number];

function formatFeatureName(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\bz score\b/gi, "Z-Score")
    .replace(/\bis\b/gi, "")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

type Props = {
  features: ShapEntry[];
  anomalyScore?: number | null;
};

export function ShapFeatureBar({ features, anomalyScore }: Props) {
  if (!features || features.length === 0) return null;

  const maxAbs = Math.max(...features.map(([, v]) => Math.abs(v)));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Anomaly score meter */}
      {anomalyScore != null && (
        <div style={{ marginBottom: 4 }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontSize: 11, marginBottom: 5,
          }}>
            <span style={{ color: "var(--color-text-secondary)" }}>Anomaly score</span>
            <span style={{
              fontFamily: "var(--font-mono), monospace",
              fontWeight: 700,
              fontSize: 12,
              color: anomalyScore > 0.7 ? "var(--sev-high-text)"
                   : anomalyScore > 0.4 ? "var(--sev-med-text)"
                   : "var(--color-text-secondary)",
            }}>
              {anomalyScore.toFixed(4)}
            </span>
          </div>
          <div style={{
            height: 6, borderRadius: 4,
            background: "var(--color-background-tertiary)",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${Math.min(anomalyScore * 100, 100)}%`,
              background: anomalyScore > 0.7 ? "var(--sev-high-bar)"
                        : anomalyScore > 0.4 ? "var(--sev-med-bar)"
                        : "var(--sev-low-bar)",
              borderRadius: 4,
              transition: "width 0.4s ease",
            }} />
          </div>
        </div>
      )}

      {/* SHAP feature bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {features.map(([name, value]) => {
          const pct = maxAbs > 0 ? (Math.abs(value) / maxAbs) * 100 : 0;
          const positive = value >= 0;
          const barColor = positive ? "var(--sev-med-bar)" : "var(--color-accent-default)";
          const textColor = positive ? "var(--sev-med-text)" : "var(--color-accent-default)";

          return (
            <div key={name}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "baseline", marginBottom: 4, gap: 8,
              }}>
                <span style={{ fontSize: 11, color: "var(--color-text-secondary)", minWidth: 0, flex: 1 }}>
                  {formatFeatureName(name)}
                </span>
                <span style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 11, fontWeight: 600, color: textColor,
                  flexShrink: 0,
                }}>
                  {positive ? "+" : ""}{value.toFixed(4)}
                </span>
              </div>
              <div style={{
                height: 5, borderRadius: 3,
                background: "var(--color-background-tertiary)",
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: barColor,
                  borderRadius: 3,
                  transition: "width 0.45s ease",
                }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        fontSize: 10, color: "var(--color-text-tertiary)",
        paddingTop: 2,
        borderTop: "1px solid var(--color-border-tertiary)",
        marginTop: 2,
      }}>
        Amber = drives anomaly flag · Blue = suppresses flag · IsolationForest + SHAP
      </div>
    </div>
  );
}
