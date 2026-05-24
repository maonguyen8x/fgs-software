import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  const { status } = z.object({ status: z.enum(["unread", "read", "done"]) }).parse(await request.json());
  const message = await prisma.message.update({ where: { id }, data: { status } });
  return NextResponse.json(message);
}
