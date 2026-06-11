import { NextResponse } from "next/server";
import { getSiteDefaultLocale } from "@/lib/site-default-locale";
import { getSettingsMapSafe } from "@/lib/settings-safe";
import { parsePublicPathMapsFromSettings } from "@/lib/public-paths";

/** Single payload for middleware — avoids two HTTP round-trips per navigation. */
export async function GET() {
  const [locale, settings] = await Promise.all([getSiteDefaultLocale(), getSettingsMapSafe()]);
  const pathMaps = parsePublicPathMapsFromSettings(settings);

  return NextResponse.json(
    { defaultLocale: locale, pathMaps },
    { headers: { "Cache-Control": "no-store, must-revalidate" } }
  );
}
