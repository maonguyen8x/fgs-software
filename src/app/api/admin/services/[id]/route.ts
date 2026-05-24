import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";

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
  const data = schema.parse(await request.json());
  const item = await prisma.service.update({ where: { id }, data });
  return NextResponse.json(item);
}
