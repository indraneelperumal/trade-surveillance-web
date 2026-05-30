"use client";

import { Search, X } from "lucide-react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchInput({
  value,
  onChange,
  placeholder = "Search symbol, trader, or alert ID…",
  className = "",
}: SearchInputProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md border border-[var(--color-border-secondary)] bg-[var(--color-background-primary)] px-2.5 py-1.5 ${className}`}
    >
      <Search size={14} className="shrink-0 text-[var(--color-text-tertiary)]" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-0 bg-transparent text-[12px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="shrink-0 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}
