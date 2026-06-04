import { NextResponse } from "next/server";
import { getSiteDefaultLocale } from "@/lib/site-default-locale";

export async function GET() {
  const locale = await getSiteDefaultLocale();
  return NextResponse.json(
    { locale },
    { headers: { "Cache-Control": "no-store, must-revalidate" } }
  );
}
