import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";

const schema = z.object({
  name: z.string().min(1),
  nameJa: z.string().optional(),
  nameVi: z.string().optional(),
  city: z.string().min(1),
  cityJa: z.string().optional(),
  cityVi: z.string().optional(),
  address: z.string().min(1),
  addressJa: z.string().optional(),
  addressVi: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  isHeadquarters: z.boolean().default(false),
  order: z.number().default(0),
  isVisible: z.boolean().default(true),
});

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  try {
    const data = schema.parse(await request.json());
    const branch = await prisma.companyBranch.create({ data });
    afterAdminMutation(CACHE_TAGS.branches);
    return NextResponse.json(branch, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
