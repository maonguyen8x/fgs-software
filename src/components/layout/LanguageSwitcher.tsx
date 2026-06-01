"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { writeLocaleCookie } from "@/lib/i18n/client-locale";
import { useMounted } from "@/hooks/use-mounted";
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

function LocaleTriggerContent({ locale }: { locale: Locale }) {
  const { flag, label } = localeConfig[locale];
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden className="text-base leading-none">
        {flag}
      </span>
      <span className="text-xs font-bold tracking-wider">{label}</span>
    </span>
  );
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations("language");
  const mounted = useMounted();

  const handleChange = (next: string) => {
    const nextLocale = next as Locale;
    if (nextLocale === locale) return;
    writeLocaleCookie(nextLocale);
    window.location.assign(buildLocaleHref(pathname, nextLocale));
  };

  if (!mounted) {
    return (
      <div
        aria-label={t("switch")}
        className="flex h-9 w-[108px] items-center justify-between rounded-lg border border-theme bg-surface px-2.5 text-sm text-theme shadow-sm"
      >
        <LocaleTriggerContent locale={locale} />
      </div>
    );
  }

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger
        aria-label={t("switch")}
        className="h-9 w-[108px] cursor-pointer border-theme bg-surface px-2.5 text-sm text-theme shadow-sm"
      >
        <SelectValue>
          <LocaleTriggerContent locale={locale} />
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
