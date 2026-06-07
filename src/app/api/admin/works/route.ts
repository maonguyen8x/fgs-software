import { NextResponse } from "next/server";
import { z } from "zod";
import slugify from "slugify";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";

const schema = z.object({
  title: z.string().min(1),
  titleJa: z.string().optional(),
  titleVi: z.string().optional(),
  slug: z.string().optional(),
  summary: z.string().min(1),
  summaryJa: z.string().optional(),
  summaryVi: z.string().optional(),
  description: z.string().min(1),
  descriptionJa: z.string().optional(),
  descriptionVi: z.string().optional(),
  thumbnail: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  techStack: z.array(z.string()).default([]),
  category: z.enum(["web", "mobile", "api", "other"]),
  duration: z.string().optional(),
  demoUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  videoSource: z.enum(["upload", "youtube", "dailymotion"]).optional(),
  order: z.number().default(0),
  isVisible: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  try {
    const body = schema.parse(await request.json());
    const slug = body.slug || slugify(body.title, { lower: true, strict: true });
    const work = await prisma.work.create({ data: { ...body, slug } });
    await afterAdminMutation(CACHE_TAGS.works);
    return NextResponse.json(work, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
