import { Card } from "@/components/ui/Card";

type AlertMetricRowProps = {
  total: number;
  openCount: number;
  inProgressCount: number;
  highCount: number;
};

export function AlertMetricRow({
  total,
  openCount,
  inProgressCount,
  highCount,
}: AlertMetricRowProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <Card className="p-4">
        <div className="mb-1 text-[11px] tracking-[0.06em] text-[var(--color-text-secondary)] uppercase">
          Total alerts
        </div>
        <div className="text-2xl font-medium">{total}</div>
        <div className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
          {openCount} open · {inProgressCount} in progress
        </div>
      </Card>
      <Card className="p-4">
        <div className="mb-1 text-[11px] tracking-[0.06em] text-[var(--color-text-secondary)] uppercase">
          High severity
        </div>
        <div className="text-2xl font-medium text-[#A32D2D]">{highCount}</div>
        <div className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
          Require immediate review
        </div>
      </Card>
      <Card className="p-4">
        <div className="mb-1 text-[11px] tracking-[0.06em] text-[var(--color-text-secondary)] uppercase">
          Avg. resolution
        </div>
        <div className="text-2xl font-medium">-</div>
        <div className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
          Available after historical data loads
        </div>
      </Card>
      <Card className="p-4">
        <div className="mb-1 text-[11px] tracking-[0.06em] text-[var(--color-text-secondary)] uppercase">
          Model precision
        </div>
        <div className="text-2xl font-medium">-</div>
        <div className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
          Pulls from model runs page
        </div>
      </Card>
    </div>
  );
}
