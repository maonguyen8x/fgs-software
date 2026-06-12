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
const updateSchema = z.record(z.string());

async function readEmailSettingsFromDb(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: [...EMAIL_SETTING_KEYS] } },
  });
  return rows.reduce<Record<string, string>>((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

function maskSettingValue(key: EmailSettingKey, value: string): string {
  if (EMAIL_SECRET_KEYS.includes(key)) {
    return maskSecretForInput(value) ?? "";
  }
  return value;
}

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  const stored = await readEmailSettingsFromDb();
  const config = resolveEmailConfig(stored);
  const values: Record<string, string> = {};

  for (const key of EMAIL_SETTING_KEYS) {
    const raw = stored[key] ?? "";
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
  const existing = await readEmailSettingsFromDb();

  const updates: Array<{ key: string; value: string }> = [];

  for (const key of EMAIL_SETTING_KEYS) {
    if (!(key in body)) continue;
    const incoming = String(body[key] ?? "").trim();

    if (EMAIL_SECRET_KEYS.includes(key)) {
      if (!incoming || incoming.includes("•")) continue;
    } else if (!incoming) {
      continue;
    }

    updates.push({ key, value: incoming });
  }

  if (updates.length === 0) {
    return NextResponse.json(
      { error: "No changes to save. Enter at least one field or re-enter secret values." },
      { status: 400 }
    );
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

  const merged = { ...existing, ...Object.fromEntries(updates.map((u) => [u.key, u.value])) };
  const config = resolveEmailConfig(merged);

  return NextResponse.json({
    success: true,
    configured: isEmailConfigActive(config),
    inbox: config.contactInbox,
  });
}
