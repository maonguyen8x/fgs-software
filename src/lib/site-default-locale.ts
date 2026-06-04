import "server-only";

import { unstable_cache } from "next/cache";
import { defaultLocale, locales, type Locale } from "@/i18n/routing";
import { getSettingsMapSafe } from "@/lib/settings-safe";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { SITE_DEFAULT_LOCALE_KEY } from "@/lib/site-default-locale-keys";

export { SITE_DEFAULT_LOCALE_COOKIE, SITE_DEFAULT_LOCALE_KEY } from "@/lib/site-default-locale-keys";

export function resolveSiteDefaultLocale(settings: Record<string, string>): Locale {
  const raw = settings[SITE_DEFAULT_LOCALE_KEY]?.trim();
  if (raw && locales.includes(raw as Locale)) return raw as Locale;
  return defaultLocale;
}

export const getSiteDefaultLocale = unstable_cache(
  async (): Promise<Locale> => {
    const settings = await getSettingsMapSafe();
    return resolveSiteDefaultLocale(settings);
  },
  ["site-default-locale"],
  { revalidate: 60, tags: [CACHE_TAGS.settings] }
);
