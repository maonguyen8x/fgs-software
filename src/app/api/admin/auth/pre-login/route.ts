import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyAdminToken } from "@/lib/admin-signed-token";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  captchaPassToken: z.string().min(1),
});

/** Check credentials + captcha before showing TOTP step (no session created). */
export async function POST(request: Request) {
  try {
    const { email, password, captchaPassToken } = schema.parse(await request.json());

    const captcha = verifyAdminToken<{ type: string }>(captchaPassToken);
    if (!captcha || captcha.type !== "captcha_pass") {
      return NextResponse.json({ error: "Captcha required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    return NextResponse.json({ ok: true, requiresTotp: Boolean(user.totpEnabled) });
  } catch (err) {
    console.error("[pre-login]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
