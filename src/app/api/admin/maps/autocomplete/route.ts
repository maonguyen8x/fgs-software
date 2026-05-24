import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { GOOGLE_MAPS_AUTOCOMPLETE_MIN_CHARS } from "@/config/google-maps";
import { isGoogleMapsApiConfigured } from "@/lib/maps/google-maps-api";
import { isMapsSearchAvailable, searchLocationSuggestions } from "@/lib/maps/location-search";

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const input = new URL(request.url).searchParams.get("input")?.trim() ?? "";
  if (input.length < GOOGLE_MAPS_AUTOCOMPLETE_MIN_CHARS) {
    return NextResponse.json({
      suggestions: [],
      googleApiConfigured: isGoogleMapsApiConfigured(),
      searchAvailable: isMapsSearchAvailable(),
    });
  }

  const suggestions = await searchLocationSuggestions(input);
  return NextResponse.json({
    suggestions,
    googleApiConfigured: isGoogleMapsApiConfigured(),
    searchAvailable: isMapsSearchAvailable(),
  });
}
