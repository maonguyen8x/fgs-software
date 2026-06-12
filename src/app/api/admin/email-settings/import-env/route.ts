import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { EMAIL_ENV_MAP, EMAIL_SETTING_KEYS } from "@/lib/email/setting-keys";

function readEnvForKey(key: (typeof EMAIL_SETTING_KEYS)[number]): string {
  for (const envKey of EMAIL_ENV_MAP[key]) {
    const value = process.env[envKey]?.trim();
    if (value) return value;
  }
  return "";
}

export async function POST() {
  const { error } = await requireAdminSession();
  if (error) return error;

  const imported: string[] = [];
  const skipped: string[] = [];

  for (const key of EMAIL_SETTING_KEYS) {
    const value = readEnvForKey(key);
    if (!value) {
      skipped.push(key);
      continue;
    }
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    imported.push(key);
  }

  afterAdminMutation(CACHE_TAGS.settings);

  return NextResponse.json({
    success: true,
    imported,
    skipped,
    message:
      imported.length > 0
        ? `Imported ${imported.length} email setting(s) from server environment.`
        : "No email variables found in server environment — add GMAIL_USER + GMAIL_APP_PASSWORD or RESEND_API_KEY on Vercel first.",
  });
}
