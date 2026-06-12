import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { adminDraftSettingKey, parseDraftPayload } from "@/lib/admin-settings-draft";

const saveSchema = z.object({
  scope: z.string().min(1).max(64),
  data: z.record(z.string()),
});

export async function GET(request: Request) {
  const { error, session } = await requireAdminSession();
  if (error) return error;

  const scope = new URL(request.url).searchParams.get("scope")?.trim();
  if (!scope) {
    return NextResponse.json({ error: "scope required" }, { status: 400 });
  }

  const userId = session!.user!.id ?? session!.user!.email ?? "admin";
  const row = await prisma.setting.findUnique({
    where: { key: adminDraftSettingKey(userId, scope) },
  });

  return NextResponse.json({
    scope,
    data: parseDraftPayload(row?.value) ?? {},
    hasDraft: Boolean(row?.value?.trim()),
  });
}

export async function PUT(request: Request) {
  const { error, session } = await requireAdminSession();
  if (error) return error;

  const { scope, data } = saveSchema.parse(await request.json());
  const userId = session!.user!.id ?? session!.user!.email ?? "admin";
  const key = adminDraftSettingKey(userId, scope);
  const payload = JSON.stringify(data);

  await prisma.setting.upsert({
    where: { key },
    update: { value: payload },
    create: { key, value: payload },
  });

  return NextResponse.json({ success: true, scope });
}

export async function DELETE(request: Request) {
  const { error, session } = await requireAdminSession();
  if (error) return error;

  const scope = new URL(request.url).searchParams.get("scope")?.trim();
  if (!scope) {
    return NextResponse.json({ error: "scope required" }, { status: 400 });
  }

  const userId = session!.user!.id ?? session!.user!.email ?? "admin";
  await prisma.setting.deleteMany({
    where: { key: adminDraftSettingKey(userId, scope) },
  });

  return NextResponse.json({ success: true });
}
