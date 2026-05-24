import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";

const teamSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  roleJa: z.string().optional(),
  roleVi: z.string().optional(),
  bio: z.string().optional(),
  bioJa: z.string().optional(),
  bioVi: z.string().optional(),
  avatar: z.string().optional(),
  experience: z.number().optional().nullable(),
  skills: z.array(z.string()).optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  order: z.number().optional(),
  isVisible: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  try {
    const data = teamSchema.parse(await request.json());
    const member = await prisma.teamMember.update({ where: { id }, data });
    afterAdminMutation(CACHE_TAGS.team);
    return NextResponse.json(member);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  await prisma.teamMember.delete({ where: { id } });
  afterAdminMutation(CACHE_TAGS.team);
  return NextResponse.json({ success: true });
}
