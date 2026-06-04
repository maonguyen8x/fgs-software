import { isValidLocale } from "@/config/locale";
import type { Locale } from "@/i18n/routing";
import { SITE_DEFAULT_LOCALE_COOKIE } from "@/lib/site-default-locale-keys";

export function writeSiteDefaultLocaleCookie(locale: Locale): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SITE_DEFAULT_LOCALE_COOKIE}=${locale};path=/;max-age=31536000;SameSite=Lax`;
}

/** Fetch admin-configured default locale and sync the middleware cookie. */
export async function syncSiteDefaultLocaleCookieFromServer(): Promise<Locale | null> {
  try {
    const res = await fetch("/api/public/default-locale", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { locale?: string };
    if (!isValidLocale(data.locale)) return null;
    writeSiteDefaultLocaleCookie(data.locale);
    return data.locale;
  } catch {
    return null;
  }
}
