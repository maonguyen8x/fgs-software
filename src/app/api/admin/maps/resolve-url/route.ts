import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin-auth";
import { resolveGoogleMapsLink } from "@/lib/maps/location-search";
import { logger } from "@/lib/logger";

const schema = z.object({ url: z.string().min(3) });

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const { url } = schema.parse(await request.json());
    const location = await resolveGoogleMapsLink(url);

    if (!location) {
      return NextResponse.json({ code: "RESOLVE_FAILED" }, { status: 422 });
    }

    return NextResponse.json({ location });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ code: "INVALID_URL" }, { status: 400 });
    }
    logger.error("Maps resolve-url failed", {
      message: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
  }
}
