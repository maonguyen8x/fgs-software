import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";

const schema = z.object({
  title: z.string().min(1).optional(),
  titleJa: z.string().optional(),
  titleVi: z.string().optional(),
  summary: z.string().min(1).optional(),
  summaryJa: z.string().optional(),
  summaryVi: z.string().optional(),
  content: z.string().min(1).optional(),
  contentJa: z.string().optional(),
  contentVi: z.string().optional(),
  thumbnail: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "published"]).optional(),
  publishedAt: z.string().datetime().nullable().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  try {
    const body = schema.parse(await request.json());
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...body,
        publishedAt:
          body.publishedAt === null
            ? null
            : body.publishedAt
              ? new Date(body.publishedAt)
              : undefined,
      },
    });
    afterAdminMutation(CACHE_TAGS.blog);
    return NextResponse.json(post);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  await prisma.blogPost.delete({ where: { id } });
  afterAdminMutation(CACHE_TAGS.blog);
  return NextResponse.json({ success: true });
}
