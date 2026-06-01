import {
  buildMapEmbedUrl,
  fetchPlaceDetails,
  fetchPlaceSuggestions,
  geocodeAddress,
  isGoogleMapsApiConfigured,
  type MapLocationResult,
} from "./google-maps-api";
import { parseGoogleMapsUrl } from "./parse-google-maps-url";
import {
  fetchNominatimSuggestions,
  geocodeNominatim,
  nominatimSuggestionToLocation,
  reverseNominatim,
} from "./nominatim-api";
import { logger } from "@/lib/logger";

export interface LocationSuggestion {
  id: string;
  description: string;
  latitude?: number;
  longitude?: number;
  provider: "google" | "nominatim";
}

export function isMapsSearchAvailable(): boolean {
  return true;
}

export async function searchLocationSuggestions(input: string): Promise<LocationSuggestion[]> {
  const trimmed = input.trim();
  if (trimmed.length < 3) return [];

  const results: LocationSuggestion[] = [];

  if (isGoogleMapsApiConfigured()) {
    const google = await fetchPlaceSuggestions(trimmed);
    for (const item of google) {
      results.push({
        id: item.placeId,
        description: item.description,
        provider: "google",
      });
    }
  }

  const nominatim = await fetchNominatimSuggestions(trimmed);
  for (const item of nominatim) {
    if (results.some((r) => r.description === item.description)) continue;
    results.push({
      id: item.id,
      description: item.description,
      latitude: item.latitude,
      longitude: item.longitude,
      provider: "nominatim",
    });
  }

  return results.slice(0, 8);
}

export async function resolveLocationSuggestion(suggestion: LocationSuggestion): Promise<MapLocationResult | null> {
  if (suggestion.latitude !== undefined && suggestion.longitude !== undefined) {
    return nominatimSuggestionToLocation({
      id: suggestion.id,
      description: suggestion.description,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    });
  }

  if (suggestion.provider === "google") {
    return fetchPlaceDetails(suggestion.id);
  }

  return null;
}

export async function resolveGoogleMapsLink(inputUrl: string): Promise<MapLocationResult | null> {
  const trimmed = inputUrl.trim();
  if (!trimmed) return null;

  let finalUrl = trimmed;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const response = await fetch(trimmed, {
        method: "GET",
        redirect: "follow",
        headers: { "User-Agent": "FGS-Software/1.0" },
      });
      finalUrl = response.url || trimmed;
    } catch (error) {
      logger.warn("Maps link redirect failed", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const parsed = parseGoogleMapsUrl(finalUrl);

  if (parsed.placeId && isGoogleMapsApiConfigured()) {
    const fromPlace = await fetchPlaceDetails(parsed.placeId);
    if (fromPlace) return fromPlace;
  }

  if (parsed.latitude !== undefined && parsed.longitude !== undefined) {
    const reversed =
      (await reverseGeocodeCoords(parsed.latitude, parsed.longitude)) ??
      (await reverseNominatim(parsed.latitude, parsed.longitude)) ??
      "";
    return {
      address: reversed,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      embedUrl: buildMapEmbedUrl(parsed.latitude, parsed.longitude),
    };
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    if (isGoogleMapsApiConfigured()) {
      const google = await geocodeAddress(trimmed);
      if (google) return google;
    }
    return geocodeNominatim(trimmed);
  }

  return null;
}

async function reverseGeocodeCoords(latitude: number, longitude: number): Promise<string | null> {
  if (!isGoogleMapsApiConfigured()) return null;

  const params = new URLSearchParams({
    latlng: `${latitude},${longitude}`,
    key: process.env.GOOGLE_MAPS_API_KEY!.trim(),
  });
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
  );
  if (!response.ok) return null;

  const data = (await response.json()) as {
    status: string;
    results?: Array<{ formatted_address?: string }>;
  };
  if (data.status !== "OK" || !data.results?.[0]?.formatted_address) return null;
  return data.results[0].formatted_address;
}
