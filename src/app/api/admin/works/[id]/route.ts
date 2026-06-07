import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";

const schema = z.object({
  title: z.string().optional(),
  titleJa: z.string().optional(),
  titleVi: z.string().optional(),
  summary: z.string().optional(),
  summaryJa: z.string().optional(),
  summaryVi: z.string().optional(),
  description: z.string().optional(),
  descriptionJa: z.string().optional(),
  descriptionVi: z.string().optional(),
  thumbnail: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  techStack: z.array(z.string()).optional(),
  category: z.enum(["web", "mobile", "api", "other"]).optional(),
  duration: z.string().optional(),
  demoUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  videoSource: z.enum(["upload", "youtube", "dailymotion"]).optional(),
  order: z.number().optional(),
  isVisible: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  const data = schema.parse(await request.json());
  const work = await prisma.work.update({ where: { id }, data });
  await afterAdminMutation(CACHE_TAGS.works);
  return NextResponse.json(work);
}
