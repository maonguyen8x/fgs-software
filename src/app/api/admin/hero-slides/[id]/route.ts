import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { isYouTubeUrl, parseYouTubeVideoId, getYouTubeThumbnail } from "@/lib/youtube";

const schema = z.object({
  mediaType: z.enum(["image", "video", "youtube"]).optional(),
  imageUrl: z.string().min(1).optional(),
  videoUrl: z.string().nullable().optional(),
  alt: z.string().optional(),
  title: z.string().optional(),
  titleJa: z.string().optional(),
  titleVi: z.string().optional(),
  order: z.number().optional(),
  isVisible: z.boolean().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  try {
    const data = schema.parse(await request.json());
    const patch = { ...data };
    if (patch.videoUrl && isYouTubeUrl(patch.videoUrl)) {
      const videoId = parseYouTubeVideoId(patch.videoUrl);
      if (!videoId) {
        return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
      }
      patch.mediaType = "youtube";
      if (!patch.imageUrl) patch.imageUrl = getYouTubeThumbnail(videoId);
    }
    const row = await prisma.heroScrollSlide.update({ where: { id }, data: patch });
    afterAdminMutation(CACHE_TAGS.heroSlides);
    return NextResponse.json(row);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  await prisma.heroScrollSlide.delete({ where: { id } });
  afterAdminMutation(CACHE_TAGS.heroSlides);
  return NextResponse.json({ success: true });
}
