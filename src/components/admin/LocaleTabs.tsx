"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { cn } from "@/lib/utils";

interface LocaleFieldProps {
  prefix: string;
  labels: { en: string; ja: string; vi: string };
  values: Record<string, string | boolean | undefined>;
  onChange: (field: string, value: string) => void;
  multiline?: boolean;
  required?: boolean;
  /** e.g. "Tiêu đề" / "Mô tả" — shown above tabs so fields are distinguishable */
  sectionTitle?: string;
}

export function LocaleTabs({
  prefix,
  labels,
  values,
  onChange,
  multiline,
  required,
  sectionTitle,
}: LocaleFieldProps) {
  const [activeTab, setActiveTab] = useState<"en" | "ja" | "vi">("en");

  const fields = [
    { key: prefix, label: labels.en, tab: "en" as const },
    { key: `${prefix}Ja`, label: labels.ja, tab: "ja" as const },
    { key: `${prefix}Vi`, label: labels.vi, tab: "vi" as const },
  ];

  const InputComp = multiline ? Textarea : Input;
  const activeField = fields.find((field) => field.tab === activeTab) ?? fields[0];

  const handleTabClick = (tab: "en" | "ja" | "vi") => {
    setActiveTab(tab);
  };

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4">
      {sectionTitle ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-700">{sectionTitle}</p>
      ) : null}
      <div className="flex flex-wrap gap-1 border-b border-theme" role="tablist">
        {fields.map((field) => (
          <button
            key={field.tab}
            type="button"
            role="tab"
            aria-selected={activeTab === field.tab}
            aria-controls={`${prefix}-${field.tab}`}
            onClick={(e) => {
              e.preventDefault();
              handleTabClick(field.tab);
            }}
            className={cn(
              "relative z-10 inline-block cursor-pointer rounded-t-lg px-4 py-2 text-sm font-medium transition-colors",
              activeTab === field.tab
                ? "border-b-2 border-primary-600 text-primary-700 dark:text-primary-300"
                : "text-muted-theme hover:text-primary-600 dark:hover:text-primary-300"
            )}
          >
            {field.label}
            {field.tab !== "en" && !values[field.key] && (
              <span className="ml-1 text-xs text-amber-600" aria-hidden="true">*</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <RequiredLabel htmlFor={`${prefix}-${activeField.tab}`} required={required && activeField.tab === "en"}>
          {activeField.label}
        </RequiredLabel>
        <InputComp
          id={`${prefix}-${activeField.tab}`}
          className="relative z-0 mt-1"
          value={String(values[activeField.key] ?? "")}
          onChange={(event) => onChange(activeField.key, event.target.value)}
          required={required && activeField.tab === "en"}
          rows={multiline ? 4 : undefined}
        />
      </div>
    </div>
  );
}
