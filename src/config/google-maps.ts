export const MAP_SETTING_KEYS = {
  address: "address",
  mapAddress: "map_address",
  latitude: "map_latitude",
  longitude: "map_longitude",
  embedUrl: "google_maps_embed_url",
  placeId: "google_maps_place_id",
} as const;

export const GOOGLE_MAPS_AUTOCOMPLETE_MIN_CHARS = 3;
export const GOOGLE_MAPS_AUTOCOMPLETE_DEBOUNCE_MS = 350;
