import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { PUBLIC_PAGES } from "@/lib/page-content";

const schema = z.object({
  page: z.enum(PUBLIC_PAGES).optional(),
  key: z.string().min(1).regex(/^[a-z0-9_]+$/).optional(),
  title: z.string().optional(),
  titleJa: z.string().optional(),
  titleVi: z.string().optional(),
  subtitle: z.string().optional(),
  subtitleJa: z.string().optional(),
  subtitleVi: z.string().optional(),
  body: z.string().optional(),
  bodyJa: z.string().optional(),
  bodyVi: z.string().optional(),
  order: z.number().optional(),
  isVisible: z.boolean().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  try {
    const data = schema.parse(await request.json());
    const row = await prisma.pageContentBlock.update({ where: { id }, data });
    afterAdminMutation(CACHE_TAGS.pageBlocks);
    return NextResponse.json(row);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  await prisma.pageContentBlock.delete({ where: { id } });
  afterAdminMutation(CACHE_TAGS.pageBlocks);
  return NextResponse.json({ success: true });
}
