/**
 * Central API route constants — do not hardcode paths in components.
 */
export const API_ROUTES = {
  contact: "/api/contact",
  chat: "/api/chat",
  auth: "/api/auth",
  admin: {
    team: "/api/admin/team",
    services: "/api/admin/services",
    works: "/api/admin/works",
    messages: "/api/admin/messages",
    settings: "/api/admin/settings",
    maps: {
      autocomplete: "/api/admin/maps/autocomplete",
      placeDetails: "/api/admin/maps/place-details",
      resolveUrl: "/api/admin/maps/resolve-url",
    },
    chat: "/api/admin/chat",
  },
} as const;
