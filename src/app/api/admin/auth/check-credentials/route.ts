import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { resolveDatabaseUrl } from "@/lib/db/resolve-database-url";
import {
  createAdminSessionToken,
  getSessionCookieName,
  sessionCookieOptions,
} from "@/lib/admin-session";
import {
  signDeviceTrustToken,
  signLoginPendingToken,
  verifyDeviceTrustToken,
} from "@/lib/admin-device-trust";
import { finalizeAdminLogin, validateAdminCredentials } from "@/lib/admin-login";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  totpCode: z.string().optional(),
  rememberMe: z.boolean().optional(),
  deviceId: z.string().uuid(),
  deviceTrustToken: z.string().optional(),
});

/** Step 1: verify email/password (+ TOTP). Trusted devices skip captcha. */
export async function POST(request: Request) {
  resolveDatabaseUrl();
  try {
    const body = schema.parse(await request.json());
    const result = await validateAdminCredentials(body.email, body.password, body.totpCode);

    if (!result.ok) {
      if (result.error === "requires_totp") {
        return NextResponse.json({ error: "requires_totp" }, { status: 403 });
      }
      if (result.error === "invalid_totp") {
        return NextResponse.json({ error: "invalid_totp" }, { status: 401 });
      }
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    const { user } = result;
    const remember = body.rememberMe === true;
    const trusted =
      body.deviceTrustToken &&
      verifyDeviceTrustToken(body.deviceTrustToken, user.id, body.deviceId);

    if (trusted) {
      const finalized = await finalizeAdminLogin(user.id, remember);
      if (!finalized) {
        return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
      }

      const { token, maxAge } = await createAdminSessionToken(
        {
          id: finalized.user.id,
          email: finalized.user.email,
          name: finalized.user.name,
          avatar: finalized.user.avatar,
          role: finalized.user.role,
        },
        remember
      );

      const deviceTrustToken = signDeviceTrustToken(user.id, body.deviceId);
      const response = NextResponse.json({ ok: true, deviceTrustToken });
      response.cookies.set(getSessionCookieName(), token, sessionCookieOptions(maxAge));
      return response;
    }

    const loginPendingToken = signLoginPendingToken(user.id, body.deviceId, remember);
    return NextResponse.json({
      ok: false,
      requiresCaptcha: true,
      loginPendingToken,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }
    console.error("[check-credentials]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
