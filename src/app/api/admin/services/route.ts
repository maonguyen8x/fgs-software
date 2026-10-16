import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";

const schema = z.object({
  icon: z.string(),
  title: z.string().min(1),
  titleJa: z.string().optional(),
  titleVi: z.string().optional(),
  description: z.string().min(1),
  descriptionJa: z.string().optional(),
  descriptionVi: z.string().optional(),
  techStack: z.array(z.string()).default([]),
  order: z.number().default(0),
  isVisible: z.boolean().default(true),
});

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
  const item = await prisma.service.create({ data: parsed.data });
  await afterAdminMutation(CACHE_TAGS.services);
  return NextResponse.json(item, { status: 201 });
}
