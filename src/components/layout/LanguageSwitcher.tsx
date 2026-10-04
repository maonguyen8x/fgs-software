"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLocale, useTranslations } from "next-intl";
import { Check, ChevronDown } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { writeLocaleCookie } from "@/lib/i18n/client-locale";
import { useMounted } from "@/hooks/use-mounted";
import { LocaleFlag } from "@/components/i18n/LocaleFlag";
import { cn } from "@/lib/utils";

/** Short code for the trigger + native name for the menu (always shown in its own language). */
const localeConfig: Record<Locale, { label: string; nativeName: string }> = {
  en: { label: "EN", nativeName: "English" },
  ja: { label: "JP", nativeName: "日本語" },
  vi: { label: "VN", nativeName: "Tiếng Việt" },
};

const TRIGGER_CLASS =
  "flex h-9 items-center gap-2 rounded-full bg-surface-muted pl-1.5 pr-2.5 text-heading transition-colors";

function buildLocaleHref(pathname: string, locale: Locale): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

function TriggerContent({ locale }: { locale: Locale }) {
  return (
    <>
      <LocaleFlag locale={locale} className="h-6 w-6" />
      <span className="text-sm font-semibold tracking-wide">{localeConfig[locale].label}</span>
    </>
  );
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations("language");
  const mounted = useMounted();

  const handleSelect = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    writeLocaleCookie(nextLocale);
    window.location.assign(buildLocaleHref(pathname, nextLocale));
  };

  if (!mounted) {
    return (
      <div aria-label={t("switch")} className={TRIGGER_CLASS}>
        <TriggerContent locale={locale} />
        <ChevronDown className="h-3.5 w-3.5 opacity-60" strokeWidth={2.5} />
      </div>
    );
  }

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={t("switch")}
          className={cn(
            TRIGGER_CLASS,
            "group cursor-pointer hover:bg-primary-50 hover:text-primary-700",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40",
            "data-[state=open]:bg-primary-50 data-[state=open]:text-primary-700",
            "dark:hover:bg-primary-950/60 dark:hover:text-primary-300",
            "dark:data-[state=open]:bg-primary-950/60 dark:data-[state=open]:text-primary-300"
          )}
        >
          <TriggerContent locale={locale} />
          <ChevronDown
            className="h-3.5 w-3.5 opacity-60 transition-transform duration-200 group-data-[state=open]:rotate-180"
            strokeWidth={2.5}
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={cn(
            "z-50 min-w-[176px] overflow-hidden rounded-xl bg-surface p-1 shadow-[0_10px_32px_-8px_rgba(15,23,42,0.22)]",
            "animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-1",
            "dark:shadow-[0_10px_32px_-8px_rgba(0,0,0,0.6)] dark:ring-1 dark:ring-white/10"
          )}
        >
          {locales.map((loc) => {
            const selected = loc === locale;
            return (
              <DropdownMenu.Item
                key={loc}
                onSelect={() => handleSelect(loc)}
                lang={loc}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm outline-none transition-colors",
                  "data-[highlighted]:bg-surface-muted",
                  selected ? "font-semibold text-primary-700 dark:text-primary-300" : "text-heading"
                )}
              >
                <LocaleFlag locale={loc} />
                <span className="flex-1">{localeConfig[loc].nativeName}</span>
                {selected && <Check className="h-4 w-4" strokeWidth={2.5} />}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
