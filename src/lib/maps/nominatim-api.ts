import { logger } from "@/lib/logger";
import { buildMapEmbedUrl } from "./google-maps-api";
import type { MapLocationResult } from "./google-maps-api";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const NOMINATIM_USER_AGENT = "FGS-Software/1.0 (admin-settings)";

export interface NominatimSuggestion {
  id: string;
  description: string;
  latitude: number;
  longitude: number;
}

interface NominatimSearchRow {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

async function nominatimFetch(path: string): Promise<Response> {
  return fetch(`${NOMINATIM_BASE}${path}`, {
    headers: {
      "User-Agent": NOMINATIM_USER_AGENT,
      Accept: "application/json",
    },
    cache: "no-store",
  });
}

export async function fetchNominatimSuggestions(query: string): Promise<NominatimSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  try {
    const params = new URLSearchParams({
      q: trimmed,
      format: "json",
      limit: "6",
      addressdetails: "0",
    });
    const response = await nominatimFetch(`/search?${params.toString()}`);
    if (!response.ok) return [];

    const rows = (await response.json()) as NominatimSearchRow[];
    return rows
      .map((row) => {
        const latitude = Number(row.lat);
        const longitude = Number(row.lon);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
        return {
          id: `osm:${row.place_id}`,
          description: row.display_name,
          latitude,
          longitude,
        };
      })
      .filter((row): row is NominatimSuggestion => row !== null);
  } catch (error) {
    logger.warn("Nominatim search failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

export async function reverseNominatim(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      format: "json",
    });
    const response = await nominatimFetch(`/reverse?${params.toString()}`);
    if (!response.ok) return null;

    const data = (await response.json()) as { display_name?: string };
    return data.display_name?.trim() ?? null;
  } catch {
    return null;
  }
}

export async function geocodeNominatim(address: string): Promise<MapLocationResult | null> {
  const suggestions = await fetchNominatimSuggestions(address);
  const first = suggestions[0];
  if (!first) return null;

  return {
    address: first.description,
    latitude: first.latitude,
    longitude: first.longitude,
    placeId: first.id,
    embedUrl: buildMapEmbedUrl(first.latitude, first.longitude),
  };
}

export function nominatimSuggestionToLocation(suggestion: NominatimSuggestion): MapLocationResult {
  return {
    address: suggestion.description,
    latitude: suggestion.latitude,
    longitude: suggestion.longitude,
    placeId: suggestion.id,
    embedUrl: buildMapEmbedUrl(suggestion.latitude, suggestion.longitude),
  };
}
