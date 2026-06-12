"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Languages } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { writeLocaleCookie } from "@/lib/i18n/client-locale";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

const localeConfig: Record<Locale, { flag: string; label: string }> = {
  en: { flag: "🇬🇧", label: "EN" },
  ja: { flag: "🇯🇵", label: "JP" },
  vi: { flag: "🇻🇳", label: "VN" },
};

function buildLocaleHref(pathname: string, locale: Locale): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

function LocaleFlag({ flag }: { flag: string }) {
  return (
    <span
      aria-hidden
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[15px] leading-none shadow-[0_1px_4px_rgba(15,23,42,0.14)] ring-1 ring-slate-200/80"
    >
      {flag}
    </span>
  );
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations("language");
  const mounted = useMounted();
  const active = localeConfig[locale];

  const handleSelect = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    writeLocaleCookie(nextLocale);
    window.location.assign(buildLocaleHref(pathname, nextLocale));
  };

  if (!mounted) {
    return (
      <div
        aria-label={t("switch")}
        className="flex h-9 min-w-[88px] items-center gap-2 rounded-lg border border-slate-200/90 bg-white/90 px-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-900/90"
      >
        <Languages className="h-4 w-4 text-primary-700 dark:text-primary-400" strokeWidth={2.25} />
        <span className="h-4 w-px bg-slate-200 dark:bg-slate-600" aria-hidden />
        <span className="text-sm font-bold tracking-wide text-primary-800 dark:text-primary-300">
          {active.label}
        </span>
      </div>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={t("switch")}
          className={cn(
            "group flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-200/90 bg-white/90 px-2.5 shadow-sm transition-all duration-200",
            "hover:border-primary-200 hover:bg-white hover:shadow-md",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30",
            "data-[state=open]:[&_.chevron]:rotate-180",
            "dark:border-slate-700 dark:bg-slate-900/90 dark:hover:border-primary-800"
          )}
        >
          <Languages
            className="h-4 w-4 text-primary-700 transition-colors group-hover:text-primary-600 dark:text-primary-400"
            strokeWidth={2.25}
          />
          <span className="h-4 w-px bg-slate-200 dark:bg-slate-600" aria-hidden />
          <span className="min-w-[1.5rem] text-sm font-bold tracking-wide text-primary-800 dark:text-primary-300">
            {active.label}
          </span>
          <ChevronDown
            className="chevron h-3.5 w-3.5 text-primary-600/80 transition-transform duration-200 dark:text-primary-400/80"
            strokeWidth={2.5}
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={cn(
            "z-50 min-w-[148px] overflow-hidden rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.12)]",
            "animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-1",
            "dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30"
          )}
        >
          {locales.map((loc) => {
            const { flag, label } = localeConfig[loc];
            const selected = loc === locale;
            return (
              <DropdownMenu.Item
                key={loc}
                onSelect={() => handleSelect(loc)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 outline-none transition-colors",
                  selected
                    ? "bg-primary-50/80 dark:bg-primary-950/40"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/80",
                  "focus:bg-slate-50 dark:focus:bg-slate-800/80"
                )}
              >
                <LocaleFlag flag={flag} />
                <span
                  className={cn(
                    "text-sm font-bold tracking-wide",
                    selected ? "text-primary-700 dark:text-primary-300" : "text-slate-600 dark:text-slate-300"
                  )}
                >
                  {label}
                </span>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
