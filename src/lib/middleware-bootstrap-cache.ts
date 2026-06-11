import type { NextRequest } from "next/server";
import { isValidLocale } from "@/config/locale";
import { defaultLocale, type Locale } from "@/i18n/routing";
import { defaultPublicPathMaps, type PublicPathMaps } from "@/lib/public-paths";
import { SITE_DEFAULT_LOCALE_COOKIE } from "@/lib/site-default-locale-keys";

const TTL_MS = 30_000;

interface MiddlewareBootstrap {
  defaultLocale: Locale;
  pathMaps: PublicPathMaps;
  expiresAt: number;
}

let bootstrapCache: MiddlewareBootstrap | null = null;

export function invalidateMiddlewareBootstrapCache(): void {
  bootstrapCache = null;
}

export async function getMiddlewareBootstrap(
  request: NextRequest
): Promise<{ defaultLocale: Locale; pathMaps: PublicPathMaps }> {
  const now = Date.now();
  if (bootstrapCache && bootstrapCache.expiresAt > now) {
    return {
      defaultLocale: bootstrapCache.defaultLocale,
      pathMaps: bootstrapCache.pathMaps,
    };
  }

  try {
    const url = new URL("/api/public/middleware-bootstrap", request.nextUrl.origin);
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "x-fgs-internal": "1" },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        defaultLocale?: string;
        pathMaps?: PublicPathMaps;
      };
      const locale = isValidLocale(data.defaultLocale) ? data.defaultLocale : defaultLocale;
      const pathMaps = data.pathMaps ?? defaultPublicPathMaps();
      bootstrapCache = {
        defaultLocale: locale,
        pathMaps,
        expiresAt: now + TTL_MS,
      };
      return { defaultLocale: locale, pathMaps };
    }
  } catch {
    /* ignore */
  }

  const fromCookie = request.cookies.get(SITE_DEFAULT_LOCALE_COOKIE)?.value;
  const fallbackLocale = isValidLocale(fromCookie) ? fromCookie : defaultLocale;
  const pathMaps = defaultPublicPathMaps();
  bootstrapCache = {
    defaultLocale: fallbackLocale,
    pathMaps,
    expiresAt: now + TTL_MS,
  };
  return { defaultLocale: fallbackLocale, pathMaps };
}
