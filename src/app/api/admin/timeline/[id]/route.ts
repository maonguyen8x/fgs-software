import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";

const schema = z.object({
  milestoneDate: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  title: z.string().min(1).optional(),
  titleJa: z.string().optional(),
  titleVi: z.string().optional(),
  description: z.string().optional(),
  descriptionJa: z.string().optional(),
  descriptionVi: z.string().optional(),
  memberCount: z.number().int().min(0).optional(),
  images: z.array(z.string()).optional(),
  order: z.number().optional(),
  isVisible: z.boolean().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  try {
    const data = schema.parse(await request.json());
    const item = await prisma.timelineMilestone.update({ where: { id }, data });
    afterAdminMutation(CACHE_TAGS.timeline);
    return NextResponse.json(item);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  await prisma.timelineMilestone.delete({ where: { id } });
  afterAdminMutation(CACHE_TAGS.timeline);
  return NextResponse.json({ success: true });
}
