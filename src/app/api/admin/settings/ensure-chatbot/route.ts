import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";

/** Ensures Nova chatbot is enabled in site settings (admin only). */
export async function POST() {
  const { error } = await requireAdminSession();
  if (error) return error;

  await prisma.setting.upsert({
    where: { key: "chatbot_enabled" },
    update: { value: "true" },
    create: { key: "chatbot_enabled", value: "true" },
  });

  afterAdminMutation(CACHE_TAGS.settings);

  return NextResponse.json({ success: true, chatbot_enabled: "true" });
}
