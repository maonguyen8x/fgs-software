import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { verifyTotpCode } from "@/lib/admin-totp";

const schema = z.object({
  secret: z.string().min(16),
  code: z.string().min(6).max(8),
});

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if (auth.error) return auth.error;

  try {
    const { secret, code } = schema.parse(await request.json());

    if (!verifyTotpCode(secret, code)) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: auth.session.user.id },
      data: { totpSecret: secret, totpEnabled: true },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
