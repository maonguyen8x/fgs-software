import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { buildTotpQrDataUrl, createTotpSecret } from "@/lib/admin-totp";

export async function POST() {
  const auth = await requireAdminSession();
  if (auth.error) return auth.error;

  const user = await prisma.user.findUnique({
    where: { id: auth.session.user.id },
    select: { email: true, totpEnabled: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.totpEnabled) {
    return NextResponse.json({ error: "2FA is already enabled" }, { status: 400 });
  }

  const secret = createTotpSecret();
  const qrDataUrl = await buildTotpQrDataUrl(user.email, secret);

  return NextResponse.json({ secret, qrDataUrl });
}
