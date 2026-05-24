import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";

const teamSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  roleJa: z.string().optional(),
  roleVi: z.string().optional(),
  bio: z.string().optional(),
  bioJa: z.string().optional(),
  bioVi: z.string().optional(),
  avatar: z.string().optional(),
  experience: z.number().optional(),
  skills: z.array(z.string()).default([]),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  order: z.number().default(0),
  isVisible: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;
  const members = await prisma.teamMember.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(members);
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  try {
    const data = teamSchema.parse(await request.json());
    const member = await prisma.teamMember.create({ data });
    afterAdminMutation(CACHE_TAGS.team);
    return NextResponse.json(member, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
