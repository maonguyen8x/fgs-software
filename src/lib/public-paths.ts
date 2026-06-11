import {
  DEFAULT_HEADER_NAV,
  type HeaderNavConfig,
  parseHeaderNavConfig,
} from "@/lib/header-nav";

/** Nav item id → internal App Router path (locale-free). */
export const NAV_ID_INTERNAL_ROUTES: Record<string, string> = {
  home: "/",
  about: "/about",
  services: "/services",
  team: "/team",
  works: "/works",
  contact: "/contact",
  blog: "/blog",
};

export interface PublicPathMaps {
  publicToInternal: Record<string, string>;
  internalToPublic: Record<string, string>;
  publicPrefixPairs: Array<{ public: string; internal: string }>;
  internalPrefixPairs: Array<{ internal: string; public: string }>;
}

export function normalizePublicPath(path: string): string {
  if (!path || path === "/") return "/";
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  const trimmed = withSlash.replace(/\/+$/, "");
  return trimmed || "/";
}

export function buildPublicPathMaps(config: HeaderNavConfig): PublicPathMaps {
  const publicToInternal: Record<string, string> = {};
  const internalToPublic: Record<string, string> = {};

  const register = (publicHref: string, internalRoute: string) => {
    const pub = normalizePublicPath(publicHref);
    const internal = normalizePublicPath(internalRoute);
    publicToInternal[pub] = internal;
    internalToPublic[internal] = pub;
  };

  for (const item of config.items) {
    if (!item.enabled) continue;
    const internal = NAV_ID_INTERNAL_ROUTES[item.id];
    if (internal) register(item.href, internal);
  }

  const publicPrefixPairs = Object.entries(publicToInternal)
    .filter(([pub, internal]) => pub !== internal)
    .map(([publicPath, internalPath]) => ({ public: publicPath, internal: internalPath }))
    .sort((a, b) => b.public.length - a.public.length);

  const internalPrefixPairs = Object.entries(internalToPublic)
    .filter(([internal, pub]) => internal !== pub)
    .map(([internalPath, publicPath]) => ({ internal: internalPath, public: publicPath }))
    .sort((a, b) => b.internal.length - a.internal.length);

  return { publicToInternal, internalToPublic, publicPrefixPairs, internalPrefixPairs };
}

export function resolvePublicToInternal(
  pathWithoutLocale: string,
  maps: PublicPathMaps
): string {
  const path = normalizePublicPath(pathWithoutLocale);

  if (maps.publicToInternal[path]) {
    return maps.publicToInternal[path];
  }

  for (const { public: pub, internal } of maps.publicPrefixPairs) {
    if (path === pub || path.startsWith(`${pub}/`)) {
      return internal + path.slice(pub.length);
    }
  }

  return path;
}

export function resolveInternalToPublic(
  pathWithoutLocale: string,
  maps: PublicPathMaps
): string {
  const path = normalizePublicPath(pathWithoutLocale);

  if (maps.internalToPublic[path]) {
    return maps.internalToPublic[path];
  }

  for (const { internal, public: pub } of maps.internalPrefixPairs) {
    if (path === internal || path.startsWith(`${internal}/`)) {
      return pub + path.slice(internal.length);
    }
  }

  return path;
}

export function parsePublicPathMapsFromSettings(
  settings: Record<string, string> | undefined
): PublicPathMaps {
  return buildPublicPathMaps(parseHeaderNavConfig(settings?.header_nav_json));
}

export function defaultPublicPathMaps(): PublicPathMaps {
  return buildPublicPathMaps(DEFAULT_HEADER_NAV);
}
