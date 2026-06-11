import type { NextRequest } from "next/server";
import { locales, type Locale } from "@/i18n/routing";
import {
  defaultPublicPathMaps,
  normalizePublicPath,
  resolveInternalToPublic,
  resolvePublicToInternal,
  type PublicPathMaps,
} from "@/lib/public-paths";

export function splitLocalePath(pathname: string): {
  locale: Locale | null;
  pathWithoutLocale: string;
} {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return { locale: null, pathWithoutLocale: "/" };
  }

  const first = segments[0];
  if (locales.includes(first as Locale)) {
    const locale = first as Locale;
    const rest = segments.slice(1).join("/");
    return {
      locale,
      pathWithoutLocale: rest ? `/${rest}` : "/",
    };
  }

  return { locale: null, pathWithoutLocale: normalizePublicPath(pathname) };
}

export async function resolveMiddlewarePublicPathMaps(
  request: NextRequest
): Promise<PublicPathMaps> {
  try {
    const url = new URL("/api/public/nav-paths", request.nextUrl.origin);
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "x-fgs-internal": "1" },
    });
    if (res.ok) {
      return (await res.json()) as PublicPathMaps;
    }
  } catch {
    /* ignore */
  }
  return defaultPublicPathMaps();
}

export type PublicPathMiddlewareResult =
  | { kind: "redirect"; url: URL }
  | { kind: "rewrite"; url: URL }
  | { kind: "none" };

/** Map admin-configured public paths ↔ internal App Router paths. */
export function resolvePublicPathMiddlewareWithMaps(
  request: NextRequest,
  maps: PublicPathMaps
): PublicPathMiddlewareResult {
  const { pathname } = request.nextUrl;
  const { locale, pathWithoutLocale } = splitLocalePath(pathname);
  if (!locale) return { kind: "none" };
  const internal = resolvePublicToInternal(pathWithoutLocale, maps);
  const canonicalPublic = resolveInternalToPublic(internal, maps);

  const current = normalizePublicPath(pathWithoutLocale);
  const internalNorm = normalizePublicPath(internal);

  if (current === internalNorm && canonicalPublic !== internalNorm) {
    const targetPath = `/${locale}${canonicalPublic === "/" ? "" : canonicalPublic}`;
    if (pathname !== targetPath) {
      return { kind: "redirect", url: new URL(targetPath, request.url) };
    }
    return { kind: "none" };
  }

  if (current !== internalNorm) {
    const rewritePath = `/${locale}${internalNorm === "/" ? "" : internalNorm}`;
    return { kind: "rewrite", url: new URL(rewritePath, request.url) };
  }

  return { kind: "none" };
}

export async function resolvePublicPathMiddleware(
  request: NextRequest
): Promise<PublicPathMiddlewareResult> {
  const maps = await resolveMiddlewarePublicPathMaps(request);
  return resolvePublicPathMiddlewareWithMaps(request, maps);
}
