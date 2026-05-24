import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";

const schema = z.object({
  providerType: z.enum(["openai", "gemini", "anthropic"]).optional(),
  displayName: z.string().min(1).optional(),
  apiKey: z.string().optional(),
  model: z.string().min(1).optional(),
  isEnabled: z.boolean().optional(),
  order: z.number().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  try {
    const body = schema.parse(await request.json());
    const { apiKey, ...rest } = body;
    const data = {
      ...rest,
      ...(apiKey && !apiKey.includes("•") ? { apiKey } : {}),
    };
    const row = await prisma.aiProvider.update({ where: { id }, data });
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
  await prisma.aiProvider.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
