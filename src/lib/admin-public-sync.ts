import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { Locale } from "@/i18n/routing";
import { writeSiteDefaultLocaleCookie } from "@/lib/client-site-default-locale";
import { notifySiteSettingsChange } from "@/lib/site-settings-sync";
import { isValidLocale } from "@/config/locale";

/** Notify open public-site tabs and refresh admin RSC after settings/content saves. */
export function publishPublicSiteUpdate(
  router?: Pick<AppRouterInstance, "refresh">,
  options?: { defaultLocale?: Locale }
): void {
  if (options?.defaultLocale && isValidLocale(options.defaultLocale)) {
    writeSiteDefaultLocaleCookie(options.defaultLocale);
  }
  notifySiteSettingsChange();
  router?.refresh();
}
