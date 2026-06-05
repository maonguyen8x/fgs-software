import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";

const schema = z.object({
  name: z.string().min(1).optional(),
  nameJa: z.string().optional(),
  nameVi: z.string().optional(),
  logoUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  order: z.number().optional(),
  isVisible: z.boolean().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  try {
    const data = schema.parse(await request.json());
    const row = await prisma.partner.update({ where: { id }, data });
    await afterAdminMutation(CACHE_TAGS.partners);
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
  await prisma.partner.delete({ where: { id } });
  await afterAdminMutation(CACHE_TAGS.partners);
  return NextResponse.json({ success: true });
}
