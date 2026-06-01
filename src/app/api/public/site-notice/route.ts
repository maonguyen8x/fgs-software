import { NextRequest, NextResponse } from "next/server";
import { routing, type Locale } from "@/i18n/routing";
import { getSettingsMapSafe } from "@/lib/settings-safe";
import { parseSiteNoticeState } from "@/lib/site-notice-state";

export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get("locale");
  const locale = routing.locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : routing.defaultLocale;

  const settings = await getSettingsMapSafe();
  const state = parseSiteNoticeState(settings, locale);

  return NextResponse.json({
    ...state,
    settings: {
      site_notice_enabled: settings.site_notice_enabled ?? "false",
      site_maintenance_mode: settings.site_maintenance_mode ?? "false",
      site_notice_variant: settings.site_notice_variant ?? "info",
      site_notice_title_vi: settings.site_notice_title_vi ?? "",
      site_notice_title_en: settings.site_notice_title_en ?? "",
      site_notice_title_ja: settings.site_notice_title_ja ?? "",
      site_notice_message_vi: settings.site_notice_message_vi ?? "",
      site_notice_message_en: settings.site_notice_message_en ?? "",
      site_notice_message_ja: settings.site_notice_message_ja ?? "",
    },
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
