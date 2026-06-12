import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { maskSecret, maskSecretForInput } from "@/lib/ai/mask-secret";
import { isEmailConfigActive, resolveEmailConfig } from "@/lib/email/config";
import {
  EMAIL_SECRET_KEYS,
  EMAIL_SETTING_KEYS,
  type EmailSettingKey,
} from "@/lib/email/setting-keys";
import { getSettingsMap } from "@/lib/settings";

const updateSchema = z.record(z.string());

function maskSettingValue(key: EmailSettingKey, value: string): string {
  if (EMAIL_SECRET_KEYS.includes(key)) {
    return maskSecretForInput(value) ?? "";
  }
  return value;
}

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  const settings = await getSettingsMap();
  const config = resolveEmailConfig(settings);
  const values: Record<string, string> = {};

  for (const key of EMAIL_SETTING_KEYS) {
    const raw = settings[key] ?? "";
    values[key] = maskSettingValue(key, raw);
  }

  return NextResponse.json({
    values,
    status: {
      configured: isEmailConfigActive(config),
      inbox: config.contactInbox,
      smtp: Boolean(config.gmailUser && config.gmailAppPassword),
      resend: Boolean(config.resendApiKey),
      gmailUser: config.gmailUser || null,
      gmailFromMasked: maskSecret(config.gmailFrom),
      resendFrom: config.resendFrom || null,
    },
  });
}

export async function PUT(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = updateSchema.parse(await request.json());
  const existing = await getSettingsMap();

  const updates: Array<{ key: string; value: string }> = [];

  for (const key of EMAIL_SETTING_KEYS) {
    if (!(key in body)) continue;
    const incoming = String(body[key] ?? "").trim();

    if (EMAIL_SECRET_KEYS.includes(key)) {
      if (!incoming || incoming.includes("•")) continue;
    }

    updates.push({ key, value: incoming });
  }

  await Promise.all(
    updates.map(({ key, value }) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  );

  await afterAdminMutation(CACHE_TAGS.settings);

  const config = resolveEmailConfig({ ...existing, ...Object.fromEntries(updates.map((u) => [u.key, u.value])) });

  return NextResponse.json({
    success: true,
    configured: isEmailConfigActive(config),
    inbox: config.contactInbox,
  });
}
