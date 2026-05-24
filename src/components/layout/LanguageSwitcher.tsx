"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { writeLocaleCookie } from "@/lib/i18n/client-locale";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const localeConfig: Record<Locale, { flag: string; label: string }> = {
  en: { flag: "🇺🇸", label: "EN" },
  ja: { flag: "🇯🇵", label: "JP" },
  vi: { flag: "🇻🇳", label: "VI" },
};

function buildLocaleHref(pathname: string, locale: Locale): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations("language");
  const [selectedLocale, setSelectedLocale] = useState(locale);

  useEffect(() => {
    setSelectedLocale(locale);
  }, [locale]);

  const current = localeConfig[selectedLocale];

  const handleChange = (next: string) => {
    const nextLocale = next as Locale;
    if (nextLocale === locale) return;

    setSelectedLocale(nextLocale);
    writeLocaleCookie(nextLocale);

    // Full navigation ensures server loads the correct message catalog for the locale.
    window.location.assign(buildLocaleHref(pathname, nextLocale));
  };

  return (
    <Select value={selectedLocale} onValueChange={handleChange}>
      <SelectTrigger
        aria-label={t("switch")}
        className="h-9 w-[108px] cursor-pointer border-theme bg-surface px-2.5 text-sm text-theme shadow-sm"
      >
        <SelectValue>
          <span className="flex items-center gap-2">
            <span aria-hidden className="text-base leading-none">
              {current.flag}
            </span>
            <span className="text-xs font-bold tracking-wider">{current.label}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="border-theme bg-surface text-theme">
        {locales.map((loc) => {
          const { flag, label } = localeConfig[loc];
          return (
            <SelectItem
              key={loc}
              value={loc}
              textValue={label}
              className="cursor-pointer focus:bg-primary-50 dark:focus:bg-primary-950/40"
            >
              <span className="flex items-center gap-2">
                <span aria-hidden className="text-base leading-none">
                  {flag}
                </span>
                <span className="text-xs font-bold tracking-wider">{label}</span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
