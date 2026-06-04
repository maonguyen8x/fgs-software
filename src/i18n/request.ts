import { getRequestConfig } from "next-intl/server";
import { DEFAULT_TIME_ZONE } from "@/config/i18n";
import { routing } from "./routing";
import { getSiteDefaultLocale } from "@/lib/site-default-locale";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as "en" | "ja" | "vi")) {
    locale = await getSiteDefaultLocale();
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: DEFAULT_TIME_ZONE,
  };
});
