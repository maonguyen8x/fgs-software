"use client";

import { useCallback, useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SkillsTagInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  hint?: string;
  className?: string;
}

export function SkillsTagInput({ value, onChange, placeholder, hint, className }: SkillsTagInputProps) {
  const [input, setInput] = useState("");

  const addTag = useCallback(
    (raw: string) => {
      const tag = raw.trim();
      if (!tag) return;
      if (value.some((s) => s.toLowerCase() === tag.toLowerCase())) return;
      onChange([...value, tag]);
    },
    [value, onChange]
  );

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const commitInput = (raw: string) => {
    const parts = raw.split(",");
    parts.forEach((part, i) => {
      if (i < parts.length - 1) addTag(part);
      else if (part.trim()) addTag(part);
    });
    setInput("");
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-theme bg-surface px-2 py-1.5",
          "focus-within:ring-2 focus-within:ring-primary-500/30"
        )}
      >
        {value.map((skill, index) => (
          <Badge
            key={`${skill}-${index}`}
            variant="secondary"
            className="gap-1 rounded-md bg-primary-50 px-2 py-0.5 text-primary-800 dark:bg-primary-950/60 dark:text-primary-200"
          >
            {skill}
            <button
              type="button"
              className="cursor-pointer rounded-full p-0.5 hover:bg-primary-200/80 dark:hover:bg-primary-800"
              onClick={() => removeTag(index)}
              aria-label={`Remove ${skill}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={input}
          placeholder={value.length === 0 ? placeholder : undefined}
          className="min-w-[120px] flex-1 border-0 bg-transparent px-1 py-1 shadow-none focus-visible:ring-0"
          onChange={(e) => {
            const v = e.target.value;
            if (v.includes(",")) {
              commitInput(v);
              return;
            }
            setInput(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (input.trim()) addTag(input);
              setInput("");
            } else if (e.key === "Backspace" && !input && value.length > 0) {
              removeTag(value.length - 1);
            }
          }}
          onBlur={() => {
            if (input.trim()) {
              addTag(input);
              setInput("");
            }
          }}
        />
      </div>
      {hint ? <p className="text-xs text-muted-theme">{hint}</p> : null}
    </div>
  );
}
