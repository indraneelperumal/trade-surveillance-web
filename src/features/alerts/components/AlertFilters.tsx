import { Chip } from "@/components/ui/Chip";
import { SearchInput } from "@/components/ui/SearchInput";

type AlertFiltersProps = {
  status: string;
  severity: string;
  search: string;
  onStatusChange: (next: string) => void;
  onSeverityChange: (next: string) => void;
  onSearchChange: (next: string) => void;
};

const statusOptions = ["all", "open", "in-progress", "closed"];
const severityOptions = ["all", "high", "med", "low"];

export function AlertFilters({
  status,
  severity,
  search,
  onStatusChange,
  onSeverityChange,
  onSearchChange,
}: AlertFiltersProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-4 py-2.5">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search symbol or alert ID…"
        className="max-w-md"
      />
      <div className="flex flex-wrap items-center gap-2">
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
        <span className="ml-2 text-[11px] text-[var(--color-text-secondary)]">Severity</span>
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
    </div>
  );
}
