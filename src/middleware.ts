import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAdminLoginSecret, getAdminLoginUrl, isDefaultAdminLoginDisabled } from "@/config/admin";
import { isAdminPublicPath } from "@/config/admin-public-paths";
import { routing } from "./i18n/routing";
import { getMiddlewareBootstrap } from "./lib/middleware-bootstrap-cache";
import { resolvePublicPathMiddlewareWithMaps } from "./lib/middleware-public-paths";
import { SITE_DEFAULT_LOCALE_COOKIE } from "./lib/site-default-locale-keys";

const PROBE_PATHS = [
  /^\/admin(\/.*)?$/i,
  /^\/wp-admin/i,
  /^\/wp-login/i,
  /^\/phpmyadmin/i,
  /^\/\.env/i,
  /^\/\.git/i,
  /^\/login$/i,
  /^\/dashboard$/i,
  /^\/manager$/i,
];

function isProbePath(pathname: string): boolean {
  if (pathname.startsWith("/access/")) return false;
  return PROBE_PATHS.some((re) => re.test(pathname));
}

function notFoundResponse(request: NextRequest): NextResponse {
  return NextResponse.rewrite(new URL("/error-ui/404", request.url));
}

function forwardWithPathname(request: NextRequest, pathname: string): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

function normalizePathname(pathname: string): string {
  return pathname.replace(/\/{2,}/g, "/");
}

export async function middleware(request: NextRequest) {
  try {
    const pathname = normalizePathname(request.nextUrl.pathname);

    if (pathname !== request.nextUrl.pathname) {
      const url = request.nextUrl.clone();
      url.pathname = pathname;
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/error-ui")) {
      return NextResponse.next();
    }

    if (pathname === "/admin/login" && isDefaultAdminLoginDisabled()) {
      return notFoundResponse(request);
    }

    if (pathname.startsWith("/access/")) {
      const secret = getAdminLoginSecret();
      const segment = pathname.replace("/access/", "").split("/")[0];
      if (!secret || segment !== secret) {
        return notFoundResponse(request);
      }
      if (pathname === `/access/${secret}` || pathname === `/access/${secret}/`) {
        return NextResponse.next();
      }
      return notFoundResponse(request);
    }

    if (isProbePath(pathname)) {
      if (isAdminPublicPath(pathname)) {
        if (pathname === "/admin/login" && isDefaultAdminLoginDisabled()) {
          return notFoundResponse(request);
        }
        return forwardWithPathname(request, pathname);
      }
      if (pathname.startsWith("/admin")) {
        const token = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
        });
        if (token) return forwardWithPathname(request, pathname);

        const loginUrl = new URL(getAdminLoginUrl(), request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
      return notFoundResponse(request);
    }

    if (
      pathname.startsWith("/api") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/access") ||
      pathname.startsWith("/_next") ||
      pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|css|js)$/)
    ) {
      return forwardWithPathname(request, pathname);
    }

    const { defaultLocale: siteDefaultLocale, pathMaps } = await getMiddlewareBootstrap(request);
    const pathResult = resolvePublicPathMiddlewareWithMaps(request, pathMaps);
    if (pathResult.kind === "redirect") {
      return NextResponse.redirect(pathResult.url);
    }
    const intlMiddleware = createIntlMiddleware({
      locales: routing.locales,
      defaultLocale: siteDefaultLocale,
      localePrefix: routing.localePrefix,
      localeDetection: false,
    });
    const intlResponse = intlMiddleware(request);
    const response =
      pathResult.kind === "rewrite" ? NextResponse.rewrite(pathResult.url) : intlResponse;

    intlResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, cookie);
    });
    response.cookies.set(SITE_DEFAULT_LOCALE_COOKIE, siteDefaultLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  } catch {
    return NextResponse.rewrite(new URL("/error-ui/500", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
