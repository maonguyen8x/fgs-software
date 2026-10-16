import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";

const schema = z.object({
  icon: z.string().optional(),
  title: z.string().optional(),
  titleJa: z.string().optional(),
  titleVi: z.string().optional(),
  description: z.string().optional(),
  descriptionJa: z.string().optional(),
  descriptionVi: z.string().optional(),
  techStack: z.array(z.string()).optional(),
  order: z.number().optional(),
  isVisible: z.boolean().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
  const item = await prisma.service.update({ where: { id }, data: parsed.data });
  await afterAdminMutation(CACHE_TAGS.services);
  return NextResponse.json(item);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  try {
    await prisma.service.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    throw error;
  }
  await afterAdminMutation(CACHE_TAGS.services);
  return NextResponse.json({ success: true });
}
