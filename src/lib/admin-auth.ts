import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";
import { isSuperAdminRole } from "./admin-roles";
import { prisma } from "./db";

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true, role: true },
  });

  if (!user?.isActive) {
    return { session: null, error: NextResponse.json({ error: "Account disabled" }, { status: 403 }) };
  }

  return { session, error: null, role: user.role };
}

export async function requireSuperAdminSession() {
  const result = await requireAdminSession();
  if (result.error) return result;

  if (!isSuperAdminRole(result.role)) {
    return {
      session: null,
      error: NextResponse.json({ error: "Super admin required" }, { status: 403 }),
    };
  }

  return result;
}
