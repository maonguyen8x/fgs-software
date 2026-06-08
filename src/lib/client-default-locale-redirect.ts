import { isValidLocale } from "@/config/locale";
import type { Locale } from "@/i18n/routing";
import { writeSiteDefaultLocaleCookie } from "@/lib/client-site-default-locale";

/** Switch the public site to the admin-configured default locale (same path, new prefix). */
export function redirectPublicSiteToLocale(targetLocale: Locale, currentLocale: Locale): void {
  if (typeof window === "undefined") return;
  if (targetLocale === currentLocale) return;

  writeSiteDefaultLocaleCookie(targetLocale);

  const { pathname, search, hash } = window.location;
  const suffix = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "";
  window.location.assign(`/${targetLocale}${suffix}${search}${hash}`);
}

export function parseLocaleFromPathname(pathname: string): Locale | null {
  const segment = pathname.split("/")[1];
  return isValidLocale(segment) ? segment : null;
}
