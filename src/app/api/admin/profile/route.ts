import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { logger } from "@/lib/logger";

const updateSchema = z.object({
  name: z.string().min(1).max(120),
  avatar: z.string().optional(),
});

export async function GET() {
  const { error, session } = await requireAdminSession();
  if (error) return error;
  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
    select: { id: true, email: true, name: true, avatar: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const { error, session } = await requireAdminSession();
  if (error) return error;
  try {
    const data = updateSchema.parse(await request.json());
    const user = await prisma.user.update({
      where: { email: session!.user!.email! },
      data: {
        name: data.name.trim(),
        avatar: data.avatar?.trim() || null,
      },
      select: { id: true, email: true, name: true, avatar: true },
    });
    return NextResponse.json(user);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors }, { status: 400 });
    }
    logger.error("Profile update failed", { error: String(e) });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
