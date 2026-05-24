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
  city: z.string().min(1).optional(),
  cityJa: z.string().optional(),
  cityVi: z.string().optional(),
  address: z.string().min(1).optional(),
  addressJa: z.string().optional(),
  addressVi: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isHeadquarters: z.boolean().optional(),
  order: z.number().optional(),
  isVisible: z.boolean().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  try {
    const data = schema.parse(await request.json());
    const branch = await prisma.companyBranch.update({ where: { id }, data });
    afterAdminMutation(CACHE_TAGS.branches);
    return NextResponse.json(branch);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  await prisma.companyBranch.delete({ where: { id } });
  afterAdminMutation(CACHE_TAGS.branches);
  return NextResponse.json({ success: true });
}
