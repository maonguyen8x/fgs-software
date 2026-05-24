"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface BlueCheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  className?: string;
}

export function BlueCheckbox({ id, checked, onChange, label, className }: BlueCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn("group flex cursor-pointer select-none items-center gap-2.5", className)}
    >
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={cn(
            "absolute inset-0 rounded-md border-2 transition-all duration-200",
            "border-slate-300 bg-white shadow-sm",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/40 peer-focus-visible:ring-offset-1",
            "group-hover:border-primary-400",
            checked && "border-primary-600 bg-primary-600 shadow-md shadow-primary-600/30"
          )}
          aria-hidden
        />
        <Check
          className={cn(
            "relative h-3.5 w-3.5 text-white transition-all duration-200",
            checked ? "scale-100 opacity-100" : "scale-75 opacity-0"
          )}
          strokeWidth={3}
        />
      </span>
      <span className="text-sm text-muted-theme">{label}</span>
    </label>
  );
}
