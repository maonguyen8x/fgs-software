import { encode } from "next-auth/jwt";
import { SESSION_REMEMBER_SECONDS, SESSION_SHORT_SECONDS } from "@/config/admin-auth";

export interface AdminSessionUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: string;
}

function useSecureCookies(): boolean {
  return process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;
}

export function getSessionCookieName(): string {
  return useSecureCookies() ? "__Secure-next-auth.session-token" : "next-auth.session-token";
}

export async function createAdminSessionToken(
  user: AdminSessionUser,
  rememberMe: boolean
): Promise<{ token: string; maxAge: number }> {
  const secret = process.env.NEXTAUTH_SECRET?.trim();
  if (!secret) throw new Error("NEXTAUTH_SECRET is not configured");

  const maxAge = rememberMe ? SESSION_REMEMBER_SECONDS : SESSION_SHORT_SECONDS;
  const token = await encode({
    token: {
      sub: user.id,
      email: user.email,
      name: user.name,
      picture: user.avatar ?? undefined,
      role: user.role,
      rememberMe,
    },
    secret,
    maxAge,
  });

  return { token, maxAge };
}

export function sessionCookieOptions(maxAge: number) {
  const secure = useSecureCookies();
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure,
    maxAge,
  };
}
