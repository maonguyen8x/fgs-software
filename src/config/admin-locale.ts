import type { Locale } from "@/i18n/routing";

/** Admin UI language (settings + sidebar) — independent from public site locale. */
export const ADMIN_LOCALE_COOKIE_NAME = "fgs_admin_locale";

export const ADMIN_UI_LOCALES = ["vi", "en"] as const;
export type AdminUiLocale = (typeof ADMIN_UI_LOCALES)[number];

export function parseAdminUiLocale(value: string | undefined | null): AdminUiLocale {
  return value === "en" ? "en" : "vi";
}

export function isAdminUiLocale(value: string): value is AdminUiLocale {
  return ADMIN_UI_LOCALES.includes(value as AdminUiLocale);
}

/** Map admin UI locale to next-intl message bundle (vi/en only in admin switcher). */
export function adminLocaleToMessagesLocale(locale: AdminUiLocale): Locale {
  return locale;
}
