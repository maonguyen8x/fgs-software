import { logger } from "@/lib/logger";
import type { ParsedMapLocation } from "./parse-google-maps-url";
import { parseGoogleMapsUrl } from "./parse-google-maps-url";

export interface MapLocationResult {
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  embedUrl: string;
}

export interface PlaceSuggestion {
  placeId: string;
  description: string;
}

function getApiKey(): string | null {
  const key = process.env.GOOGLE_MAPS_API_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

export function buildMapEmbedUrl(latitude: number, longitude: number): string {
  return `https://maps.google.com/maps?q=${latitude},${longitude}&hl=vi&z=15&output=embed`;
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
        headers: { "User-Agent": "FGS-Admin/1.0" },
      });
      finalUrl = response.url || trimmed;
    } catch (error) {
      logger.warn("Failed to follow Google Maps short URL redirect", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const parsed = parseGoogleMapsUrl(finalUrl);
  if (parsed.placeId) {
    const details = await fetchPlaceDetails(parsed.placeId);
    if (details) return details;
  }

  if (parsed.latitude !== undefined && parsed.longitude !== undefined) {
    const geocoded = await reverseGeocode(parsed.latitude, parsed.longitude);
    return {
      address: geocoded?.address ?? "",
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      embedUrl: buildMapEmbedUrl(parsed.latitude, parsed.longitude),
    };
  }

  return null;
}

export async function fetchPlaceSuggestions(input: string): Promise<PlaceSuggestion[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const params = new URLSearchParams({
    input: input.trim(),
    key: apiKey,
    language: "vi",
    components: "country:vn",
    region: "vn",
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`
  );
  if (!response.ok) return [];

  const data = (await response.json()) as {
    status: string;
    predictions?: Array<{ place_id: string; description: string }>;
  };

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    logger.warn("Places autocomplete failed", { status: data.status });
    return [];
  }

  return (data.predictions ?? []).map((item) => ({
    placeId: item.place_id,
    description: item.description,
  }));
}

export async function fetchPlaceDetails(placeId: string): Promise<MapLocationResult | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const params = new URLSearchParams({
    place_id: placeId,
    key: apiKey,
    fields: "formatted_address,name,address_components,geometry,place_id",
    language: "vi",
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`
  );
  if (!response.ok) return null;

  const data = (await response.json()) as {
    status: string;
    result?: {
      formatted_address?: string;
      place_id?: string;
      geometry?: { location?: { lat?: number; lng?: number } };
    };
  };

  if (data.status !== "OK" || !data.result?.geometry?.location) {
    logger.warn("Place details failed", { status: data.status, placeId });
    return null;
  }

  const { lat, lng } = data.result.geometry.location;
  if (lat === undefined || lng === undefined) return null;

  const address = formatAddressFromPlace(data.result) ?? data.result.formatted_address ?? "";
  return {
    address,
    latitude: lat,
    longitude: lng,
    placeId: data.result.place_id ?? placeId,
    embedUrl: buildMapEmbedUrl(lat, lng),
  };
}

async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{ address: string } | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const params = new URLSearchParams({
    latlng: `${latitude},${longitude}`,
    key: apiKey,
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
  return { address: data.results[0].formatted_address };
}

export async function geocodeAddress(address: string): Promise<MapLocationResult | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const params = new URLSearchParams({
    address: address.trim(),
    key: apiKey,
    language: "vi",
    region: "vn",
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
  );
  if (!response.ok) return null;

  const data = (await response.json()) as {
    status: string;
    results?: Array<{
      formatted_address?: string;
      place_id?: string;
      address_components?: Array<{ long_name: string; short_name: string; types: string[] }>;
      geometry?: { location?: { lat?: number; lng?: number } };
    }>;
  };

  if (data.status !== "OK" || !data.results?.[0]?.geometry?.location) return null;

  const result = data.results[0];
  const lat = result.geometry?.location?.lat;
  const lng = result.geometry?.location?.lng;
  if (lat === undefined || lng === undefined) return null;

  const formatted =
    formatAddressFromPlace({
      formatted_address: result.formatted_address,
      address_components: result.address_components,
    }) ?? result.formatted_address ?? address.trim();
  return {
    address: formatted,
    latitude: lat,
    longitude: lng,
    placeId: result.place_id,
    embedUrl: buildMapEmbedUrl(lat, lng),
  };
}

export function isGoogleMapsApiConfigured(): boolean {
  return Boolean(getApiKey());
}

function formatAddressFromPlace(result: {
  formatted_address?: string;
  name?: string;
  address_components?: Array<{ long_name: string; short_name: string; types: string[] }>;
}): string | null {
  const components = result.address_components ?? [];
  const streetNumber = components.find((c) => c.types.includes("street_number"))?.long_name;
  const route = components.find((c) => c.types.includes("route"))?.long_name;
  const locality =
    components.find((c) => c.types.includes("locality"))?.long_name ??
    components.find((c) => c.types.includes("administrative_area_level_1"))?.long_name;
  const country = components.find((c) => c.types.includes("country"))?.long_name;

  const street = [streetNumber, route].filter(Boolean).join(" ").trim();
  const parts = [street || result.name, locality, country].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  return result.formatted_address ?? null;
}
