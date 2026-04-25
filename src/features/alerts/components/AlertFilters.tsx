import { Chip } from "@/components/ui/Chip";

type AlertFiltersProps = {
  status: string;
  severity: string;
  onStatusChange: (next: string) => void;
  onSeverityChange: (next: string) => void;
};

const statusOptions = ["all", "open", "in-progress", "closed"];
const severityOptions = ["all", "high", "med", "low"];

export function AlertFilters({
  status,
  severity,
  onStatusChange,
  onSeverityChange,
}: AlertFiltersProps) {
  return (
    <div className="flex items-center gap-2 border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-4 py-2.5">
      <span className="text-[11px] text-[var(--color-text-secondary)]">Status</span>
      {statusOptions.map((option) => (
        <Chip
          key={option}
          active={status === option}
          onClick={() => onStatusChange(option)}
        >
          {option === "in-progress"
            ? "In progress"
            : option.charAt(0).toUpperCase() + option.slice(1)}
        </Chip>
      ))}
      <span className="ml-auto text-[11px] text-[var(--color-text-secondary)]">
        Severity
      </span>
      {severityOptions.map((option) => (
        <Chip
          key={option}
          active={severity === option}
          onClick={() => onSeverityChange(option)}
        >
          {option === "med" ? "Med" : option.charAt(0).toUpperCase() + option.slice(1)}
        </Chip>
      ))}
    </div>
  );
}
