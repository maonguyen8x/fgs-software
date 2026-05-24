import { LOCALE_COOKIE_NAME, parseLocale } from "@/config/locale";
import type { Locale } from "@/i18n/routing";

export function readLocaleFromDocumentCookie(): Locale {
  if (typeof document === "undefined") return parseLocale(null);
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${LOCALE_COOKIE_NAME}=`));
  return parseLocale(match?.split("=")[1]);
}

export function writeLocaleCookie(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale};path=/;max-age=31536000;SameSite=Lax`;
}
