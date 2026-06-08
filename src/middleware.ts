import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAdminLoginSecret, isDefaultAdminLoginDisabled } from "@/config/admin";
import { routing } from "./i18n/routing";
import { resolveMiddlewareDefaultLocale } from "./lib/middleware-default-locale";
import { SITE_DEFAULT_LOCALE_COOKIE } from "./lib/site-default-locale-keys";

const ADMIN_PUBLIC_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
];

function isAdminPublicPath(pathname: string): boolean {
  return ADMIN_PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

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

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

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

    const siteDefaultLocale = await resolveMiddlewareDefaultLocale(request);
    const intlMiddleware = createIntlMiddleware({
      locales: routing.locales,
      defaultLocale: siteDefaultLocale,
      localePrefix: routing.localePrefix,
      localeDetection: false,
    });
    const response = intlMiddleware(request);
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
