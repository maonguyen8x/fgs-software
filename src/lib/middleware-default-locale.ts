import type { NextRequest } from "next/server";
import { isValidLocale } from "@/config/locale";
import { defaultLocale, locales, type Locale } from "@/i18n/routing";
import { SITE_DEFAULT_LOCALE_COOKIE } from "@/lib/site-default-locale-keys";

function localeFromPathname(pathname: string): Locale | null {
  const segment = pathname.split("/")[1];
  return locales.includes(segment as Locale) ? (segment as Locale) : null;
}

/**
 * Prefer cookie / URL locale so middleware does not block every navigation on an internal API fetch.
 * Falls back to DB only on first visit without cookie.
 */
export async function resolveMiddlewareDefaultLocale(request: NextRequest): Promise<Locale> {
  const fromCookie = request.cookies.get(SITE_DEFAULT_LOCALE_COOKIE)?.value;
  if (isValidLocale(fromCookie)) return fromCookie;

  const fromPath = localeFromPathname(request.nextUrl.pathname);
  if (fromPath) return fromPath;

  try {
    const url = new URL("/api/public/default-locale", request.nextUrl.origin);
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "x-fgs-internal": "1" },
    });
    if (res.ok) {
      const data = (await res.json()) as { locale?: string };
      if (isValidLocale(data.locale)) return data.locale;
    }
  } catch {
    /* ignore */
  }

  return defaultLocale;
}
