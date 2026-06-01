"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { ADMIN_LOCALE_COOKIE_NAME, type AdminUiLocale } from "@/config/admin-locale";

const OPTIONS: { code: AdminUiLocale; label: string; dot: string; labelActive: string }[] = [
  { code: "vi", label: "Tiếng Việt", dot: "border-emerald-600 bg-emerald-600", labelActive: "text-emerald-700" },
  { code: "en", label: "English", dot: "border-primary-600 bg-primary-600", labelActive: "text-primary-700" },
];

export function AdminSettingsLocaleSwitcher() {
  const router = useRouter();
  const current = useLocale() as AdminUiLocale;
  const [pending, startTransition] = useTransition();

  const setLocale = (locale: AdminUiLocale) => {
    if (locale === current) return;
    document.cookie = `${ADMIN_LOCALE_COOKIE_NAME}=${locale};path=/;max-age=31536000;samesite=lax`;
    startTransition(() => router.refresh());
  };

  return (
    <div className="flex flex-wrap gap-5" role="radiogroup" aria-label="Admin language">
      {OPTIONS.map((opt) => {
        const selected = current === opt.code;
        return (
          <label
            key={opt.code}
            className={cn("flex cursor-pointer items-center gap-2.5", pending && "opacity-60")}
          >
            <input
              type="radio"
              name="admin_ui_locale"
              checked={selected}
              disabled={pending}
              onChange={() => setLocale(opt.code)}
              className="sr-only"
            />
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                selected ? opt.dot : "border-slate-300 bg-white"
              )}
            >
              {selected && <span className="h-2 w-2 rounded-full bg-white" />}
            </span>
            <span className={cn("text-sm font-semibold", selected ? opt.labelActive : "text-slate-600")}>
              {opt.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
