import type { Locale } from "@/i18n/routing";
import { getSettingValue } from "@/lib/i18n-content";

export interface SiteNoticeState {
  maintenance: boolean;
  noticeEnabled: boolean;
  variant: string;
  title: string;
  message: string;
}

export function parseSiteNoticeState(
  settings: Record<string, string>,
  locale: Locale
): SiteNoticeState {
  const maintenance = settings.site_maintenance_mode === "true";
  const noticeEnabled = settings.site_notice_enabled === "true";
  const variant = settings.site_notice_variant ?? "info";
  const title =
    getSettingValue(settings, "site_notice_title", locale) ||
    (maintenance ? "Maintenance" : "");
  const message = getSettingValue(settings, "site_notice_message", locale) || "";

  return { maintenance, noticeEnabled, variant, title, message };
}
