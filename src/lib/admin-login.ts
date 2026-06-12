import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/db";
import { verifyTotpCode } from "@/lib/admin-totp";

export type AdminCredentialError = "invalid_credentials" | "requires_totp" | "invalid_totp";

export type AdminCredentialResult =
  | { ok: true; user: User }
  | { ok: false; error: AdminCredentialError; user?: User };

export async function validateAdminCredentials(
  email: string,
  password: string,
  totpCode?: string
): Promise<AdminCredentialResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !user.isActive) {
    return { ok: false, error: "invalid_credentials" };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { ok: false, error: "invalid_credentials" };
  }

  if (user.totpEnabled) {
    const code = totpCode?.trim() ?? "";
    if (!code) {
      return { ok: false, error: "requires_totp", user };
    }
    if (!user.totpSecret || !verifyTotpCode(user.totpSecret, code)) {
      return { ok: false, error: "invalid_totp" };
    }
  }

  return { ok: true, user };
}

export async function finalizeAdminLogin(userId: string, rememberMe: boolean) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) return null;

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return { user, rememberMe };
}
