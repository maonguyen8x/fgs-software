import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireSuperAdminSession } from "@/lib/admin-auth";
import { ADMIN_ROLE, SUPER_ADMIN_ROLE } from "@/lib/admin-roles";

const updateSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2).max(100).optional(),
  password: z.string().min(8).max(128).optional(),
  role: z.enum([ADMIN_ROLE, SUPER_ADMIN_ROLE]).optional(),
  isActive: z.boolean().optional(),
});

async function countSuperAdmins(excludeId?: string): Promise<number> {
  return prisma.user.count({
    where: {
      role: SUPER_ADMIN_ROLE,
      isActive: true,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireSuperAdminSession();
  if (error) return error;

  const { id } = await params;
  const selfId = session!.user!.id;

  try {
    const body = updateSchema.parse(await request.json());
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (body.role === ADMIN_ROLE && existing.role === SUPER_ADMIN_ROLE) {
      const others = await countSuperAdmins(id);
      if (others === 0) {
        return NextResponse.json({ error: "Cannot remove the last super admin" }, { status: 400 });
      }
    }

    if (body.isActive === false && id === selfId) {
      return NextResponse.json({ error: "Cannot disable your own account" }, { status: 400 });
    }

    if (body.isActive === false && existing.role === SUPER_ADMIN_ROLE) {
      const others = await countSuperAdmins(id);
      if (others === 0) {
        return NextResponse.json({ error: "Cannot disable the last super admin" }, { status: 400 });
      }
    }

    if (body.email) {
      const email = body.email.trim().toLowerCase();
      const clash = await prisma.user.findFirst({
        where: { email, NOT: { id } },
      });
      if (clash) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }

    const data: {
      email?: string;
      name?: string;
      password?: string;
      role?: string;
      isActive?: boolean;
    } = {};

    if (body.email) data.email = body.email.trim().toLowerCase();
    if (body.name) data.name = body.name.trim();
    if (body.password) data.password = await bcrypt.hash(body.password, 12);
    if (body.role) data.role = body.role;
    if (body.isActive !== undefined) data.isActive = body.isActive;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireSuperAdminSession();
  if (error) return error;

  const { id } = await params;
  if (id === session!.user!.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (existing.role === SUPER_ADMIN_ROLE) {
    const others = await countSuperAdmins(id);
    if (others === 0) {
      return NextResponse.json({ error: "Cannot delete the last super admin" }, { status: 400 });
    }
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
