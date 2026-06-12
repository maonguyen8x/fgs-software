import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminToken } from "@/lib/admin-signed-token";
import {
  createAdminSessionToken,
  getSessionCookieName,
  sessionCookieOptions,
} from "@/lib/admin-session";
import {
  signDeviceTrustToken,
  verifyLoginPendingToken,
} from "@/lib/admin-device-trust";
import { finalizeAdminLogin } from "@/lib/admin-login";

const schema = z.object({
  loginPendingToken: z.string().min(1),
  captchaPassToken: z.string().min(1),
  deviceId: z.string().uuid(),
});

/** Step 2: captcha verified — establish session and trust this device. */
export async function POST(request: Request) {
  try {
    const { loginPendingToken, captchaPassToken, deviceId } = schema.parse(await request.json());

    const captcha = verifyAdminToken<{ type: string }>(captchaPassToken);
    if (!captcha || captcha.type !== "captcha_pass") {
      return NextResponse.json({ error: "captcha_required" }, { status: 400 });
    }

    const pending = verifyLoginPendingToken(loginPendingToken, deviceId);
    if (!pending) {
      return NextResponse.json({ error: "session_expired" }, { status: 400 });
    }

    const finalized = await finalizeAdminLogin(pending.userId, pending.rememberMe);
    if (!finalized) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    const { user, rememberMe } = finalized;
    const { token, maxAge } = await createAdminSessionToken(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
      rememberMe
    );

    const deviceTrustToken = signDeviceTrustToken(user.id, deviceId);
    const response = NextResponse.json({ ok: true, deviceTrustToken });
    response.cookies.set(getSessionCookieName(), token, sessionCookieOptions(maxAge));
    return response;
  } catch (err) {
    console.error("[complete-login]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
