import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;
  const rows = await prisma.setting.findMany();
  const settings = rows.reduce<Record<string, string>>((acc, r) => {
    acc[r.key] = r.value;
    return acc;
  }, {});
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const data = (await request.json()) as Record<string, string>;

  await Promise.all(
    Object.entries(data).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  );

  await afterAdminMutation(CACHE_TAGS.settings);
  return NextResponse.json({ success: true });
}
