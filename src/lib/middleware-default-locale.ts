import type { NextRequest } from "next/server";
import { isValidLocale } from "@/config/locale";
import { defaultLocale, type Locale } from "@/i18n/routing";

/** Resolve site default locale from DB (never a stale browser cookie). */
export async function resolveMiddlewareDefaultLocale(request: NextRequest): Promise<Locale> {
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
