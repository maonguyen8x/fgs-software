import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { verifyTotpCode } from "@/lib/admin-totp";

const schema = z.object({
  password: z.string().min(1),
  code: z.string().min(6).max(8),
});

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if (auth.error) return auth.error;

  try {
    const { password, code } = schema.parse(await request.json());

    const user = await prisma.user.findUnique({
      where: { id: auth.session.user.id },
    });

    if (!user || !user.totpEnabled || !user.totpSecret) {
      return NextResponse.json({ error: "2FA is not enabled" }, { status: 400 });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    if (!verifyTotpCode(user.totpSecret, code)) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { totpSecret: null, totpEnabled: false },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
