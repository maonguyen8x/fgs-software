import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";

const schema = z.object({
  milestoneDate: z.string().regex(/^\d{4}-\d{2}$/),
  title: z.string().min(1),
  titleJa: z.string().optional(),
  titleVi: z.string().optional(),
  description: z.string().optional(),
  descriptionJa: z.string().optional(),
  descriptionVi: z.string().optional(),
  memberCount: z.number().int().min(0).default(0),
  images: z.array(z.string()).default([]),
  order: z.number().default(0),
  isVisible: z.boolean().default(true),
});

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  try {
    const data = schema.parse(await request.json());
    const item = await prisma.timelineMilestone.create({ data });
    await afterAdminMutation(CACHE_TAGS.timeline);
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
