import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAdminLoginSecret, isDefaultAdminLoginDisabled } from "@/config/admin";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

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
        return NextResponse.next();
      }
      if (pathname.startsWith("/admin")) {
        const token = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
        });
        if (token) return NextResponse.next();
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
      return NextResponse.next();
    }

    return intlMiddleware(request);
  } catch {
    return NextResponse.rewrite(new URL("/error-ui/500", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
