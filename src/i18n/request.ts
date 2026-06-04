import { getRequestConfig } from "next-intl/server";
import { DEFAULT_TIME_ZONE } from "@/config/i18n";
import type { Locale } from "./routing";
import { routing } from "./routing";
import { getSiteDefaultLocale } from "@/lib/site-default-locale";
import { mergeWorksMessages } from "./fallbacks/works-messages";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = await getSiteDefaultLocale();
  }
  const loc = locale as Locale;
  const loaded = (await import(`../../messages/${loc}.json`)).default as Record<string, unknown>;

  return {
    locale: loc,
    messages: mergeWorksMessages(loaded, loc),
    timeZone: DEFAULT_TIME_ZONE,
  };
});
