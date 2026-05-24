import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin-auth";
import { isGoogleMapsApiConfigured } from "@/lib/maps/google-maps-api";
import { resolveLocationSuggestion } from "@/lib/maps/location-search";
import { logger } from "@/lib/logger";

const schema = z.object({
  id: z.string().min(1),
  description: z.string().optional(),
  provider: z.enum(["google", "nominatim"]),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const body = schema.parse(await request.json());
    const location = await resolveLocationSuggestion({
      id: body.id,
      description: body.description ?? "",
      latitude: body.latitude,
      longitude: body.longitude,
      provider: body.provider,
    });

    if (!location) {
      return NextResponse.json(
        { code: "PLACE_NOT_FOUND", googleApiConfigured: isGoogleMapsApiConfigured() },
        { status: 422 }
      );
    }

    return NextResponse.json({ location });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ code: "INVALID_PLACE" }, { status: 400 });
    }
    logger.error("Maps place-details failed", {
      message: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
  }
}
