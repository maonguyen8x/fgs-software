import { NextResponse } from "next/server";
import { getSettingsMapSafe } from "@/lib/settings-safe";
import { parsePublicPathMapsFromSettings } from "@/lib/public-paths";

export async function GET() {
  const settings = await getSettingsMapSafe();
  const maps = parsePublicPathMapsFromSettings(settings);
  return NextResponse.json(maps, {
    headers: { "Cache-Control": "no-store, must-revalidate" },
  });
}
