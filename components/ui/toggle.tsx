"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60",
        checked ? "bg-foreground" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "absolute left-1 top-1 h-5 w-5 rounded-full bg-background shadow transition-transform",
          checked && "translate-x-5"
        )}
      />
    </button>
  );
}
