export interface ParsedMapLocation {
  latitude?: number;
  longitude?: number;
  placeId?: string;
}

function parseCoordinatePair(a: string, b: string): { latitude: number; longitude: number } | null {
  const latitude = Number(a);
  const longitude = Number(b);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return { latitude, longitude };
}

export function parseGoogleMapsUrl(url: string): ParsedMapLocation {
  const decoded = decodeURIComponent(url.trim());

  const atMatch = decoded.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atMatch) {
    const coords = parseCoordinatePair(atMatch[1], atMatch[2]);
    if (coords) return coords;
  }

  const dataMatch = decoded.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (dataMatch) {
    const coords = parseCoordinatePair(dataMatch[1], dataMatch[2]);
    if (coords) return coords;
  }

  const qMatch = decoded.match(/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (qMatch) {
    const coords = parseCoordinatePair(qMatch[1], qMatch[2]);
    if (coords) return coords;
  }

  const placeIdParam = decoded.match(/[?&]place_id=([A-Za-z0-9_-]+)/);
  if (placeIdParam) return { placeId: placeIdParam[1] };

  const placePath = decoded.match(/\/place\/[^/]+\/@[^/]+.*?!1s([^!/?]+)/);
  if (placePath) return { placeId: decodeURIComponent(placePath[1]) };

  const ftidMatch = decoded.match(/[?&]ftid=([^&]+)/);
  if (ftidMatch) return { placeId: decodeURIComponent(ftidMatch[1]) };

  return {};
}
