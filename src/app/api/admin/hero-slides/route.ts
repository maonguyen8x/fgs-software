import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { isYouTubeUrl, parseYouTubeVideoId } from "@/lib/youtube";

const createSchema = z.object({
  mediaType: z.enum(["image", "video", "youtube"]).default("image"),
  imageUrl: z.string().min(1),
  videoUrl: z.string().optional(),
  alt: z.string().default(""),
  title: z.string().optional(),
  titleJa: z.string().optional(),
  titleVi: z.string().optional(),
  order: z.number().optional(),
  isVisible: z.boolean().default(true),
});

const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)),
});

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;
  const rows = await prisma.heroScrollSlide.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  try {
    const data = createSchema.parse(await request.json());
    const needsVideo = data.mediaType === "video" || data.mediaType === "youtube";
    if (needsVideo && !data.videoUrl) {
      return NextResponse.json({ error: "videoUrl required for video slides" }, { status: 400 });
    }
    if (data.mediaType === "youtube" && data.videoUrl && !parseYouTubeVideoId(data.videoUrl)) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }
    const resolvedType =
      data.videoUrl && isYouTubeUrl(data.videoUrl) ? "youtube" : data.mediaType;
    const maxOrder = await prisma.heroScrollSlide.aggregate({ _max: { order: true } });
    const order = data.order ?? (maxOrder._max.order ?? -1) + 1;
    const row = await prisma.heroScrollSlide.create({
      data: {
        ...data,
        mediaType: resolvedType,
        order,
        videoUrl: resolvedType === "video" || resolvedType === "youtube" ? data.videoUrl : null,
      },
    });
    afterAdminMutation(CACHE_TAGS.heroSlides);
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  try {
    const { orderedIds } = reorderSchema.parse(await request.json());
    await prisma.$transaction(
      orderedIds.map((id, order) =>
        prisma.heroScrollSlide.update({ where: { id }, data: { order } })
      )
    );
    afterAdminMutation(CACHE_TAGS.heroSlides);
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
