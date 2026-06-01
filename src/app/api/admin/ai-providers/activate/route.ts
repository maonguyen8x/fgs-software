import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { logger } from "@/lib/logger";

const schema = z.object({
  providerType: z.enum(["openai", "gemini", "anthropic"]),
});

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const { providerType } = schema.parse(await request.json());

    await prisma.setting.upsert({
      where: { key: "ai_provider" },
      update: { value: providerType },
      create: { key: "ai_provider", value: providerType },
    });

    afterAdminMutation(CACHE_TAGS.settings);
    logger.info("Active AI provider for Nova", { providerType });

    return NextResponse.json({ success: true, activeProvider: providerType });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors }, { status: 400 });
    }
    logger.error("Activate AI provider failed", { error: String(e) });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
