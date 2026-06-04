import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { maskSecretForInput } from "@/lib/ai/mask-secret";

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
  const [rows, activeSetting] = await Promise.all([
    prisma.aiProvider.findMany({ orderBy: { order: "asc" } }),
    prisma.setting.findUnique({ where: { key: "ai_provider" } }),
  ]);
  return NextResponse.json({
    activeProvider: activeSetting?.value?.trim() || process.env.AI_PROVIDER?.toLowerCase() || "auto",
    providers: rows.map((r) => ({
      ...r,
      apiKey: maskSecretForInput(r.apiKey),
    })),
  });
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  try {
    const data = schema.parse(await request.json());
    const row = await prisma.aiProvider.create({ data });
    return NextResponse.json(
      { ...row, apiKey: maskSecretForInput(row.apiKey) },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
