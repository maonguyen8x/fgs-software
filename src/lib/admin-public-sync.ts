import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { Locale } from "@/i18n/routing";
import { writeSiteDefaultLocaleCookie } from "@/lib/client-site-default-locale";
import { notifySiteSettingsChange } from "@/lib/site-settings-sync";
import { invalidateMiddlewareBootstrapCache } from "@/lib/middleware-bootstrap-cache";
import { isValidLocale } from "@/config/locale";

/** Notify open public-site tabs and refresh admin RSC after settings/content saves. */
export function publishPublicSiteUpdate(
  router?: Pick<AppRouterInstance, "refresh">,
  options?: { defaultLocale?: Locale }
): void {
  if (options?.defaultLocale && isValidLocale(options.defaultLocale)) {
    writeSiteDefaultLocaleCookie(options.defaultLocale);
  }
  invalidateMiddlewareBootstrapCache();
  notifySiteSettingsChange(
    options?.defaultLocale && isValidLocale(options.defaultLocale)
      ? { defaultLocale: options.defaultLocale }
      : undefined
  );
  router?.refresh();
}
