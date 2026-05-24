import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";

const schema = z.object({
  providerType: z.enum(["openai", "gemini", "anthropic"]),
  displayName: z.string().min(1),
  apiKey: z.string().optional(),
  model: z.string().min(1),
  isEnabled: z.boolean().default(true),
  order: z.number().default(0),
});

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;
  const rows = await prisma.aiProvider.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(
    rows.map((r) => ({
      ...r,
      apiKey: r.apiKey ? "••••••••" : null,
    }))
  );
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  try {
    const data = schema.parse(await request.json());
    const row = await prisma.aiProvider.create({ data });
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
