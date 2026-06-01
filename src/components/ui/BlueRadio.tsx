"use client";

import { cn } from "@/lib/utils";

interface BlueRadioOption {
  value: string;
  label: string;
}

interface BlueRadioGroupProps {
  name: string;
  value: string;
  options: BlueRadioOption[];
  onChange: (value: string) => void;
  className?: string;
}

export function BlueRadioGroup({ name, value, options, onChange, className }: BlueRadioGroupProps) {
  return (
    <div className={cn("flex flex-wrap gap-4", className)} role="radiogroup">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <label
            key={option.value}
            className="group flex cursor-pointer select-none items-center gap-2.5"
          >
            <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "absolute inset-0 rounded-full border-2 transition-all duration-200",
                  "border-slate-300 bg-white shadow-sm",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/40 peer-focus-visible:ring-offset-1",
                  "group-hover:border-primary-400",
                  selected && "border-primary-600 bg-primary-600 shadow-md shadow-primary-600/30"
                )}
                aria-hidden
              />
              <span
                className={cn(
                  "relative h-2 w-2 rounded-full bg-white transition-all duration-200",
                  selected ? "scale-100 opacity-100" : "scale-0 opacity-0"
                )}
              />
            </span>
            <span className="text-sm font-medium text-heading">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
