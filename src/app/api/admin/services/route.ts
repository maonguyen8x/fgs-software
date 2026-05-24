import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";

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
  try {
    const data = schema.parse(await request.json());
    const item = await prisma.service.create({ data });
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
