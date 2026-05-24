import { defaultLocale, locales, type Locale } from "@/i18n/routing";

export const LOCALE_COOKIE_NAME = "fgs_locale";

export function isValidLocale(value: string | undefined | null): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export function parseLocale(value: string | undefined | null): Locale {
  return isValidLocale(value) ? value : defaultLocale;
}
