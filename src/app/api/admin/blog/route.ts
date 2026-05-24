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
  content: z.string().min(1),
  contentJa: z.string().optional(),
  contentVi: z.string().optional(),
  thumbnail: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published"]).default("draft"),
  publishedAt: z.string().datetime().nullable().optional(),
});

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  try {
    const body = schema.parse(await request.json());
    const { slug: slugInput, publishedAt, ...rest } = body;
    const slug = slugInput || slugify(rest.title, { lower: true, strict: true });
    const post = await prisma.blogPost.create({
      data: {
        ...rest,
        slug,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      },
    });
    afterAdminMutation(CACHE_TAGS.blog);
    return NextResponse.json(post, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
