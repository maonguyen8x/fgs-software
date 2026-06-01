import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createHash } from "crypto";

function monthKey(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function countryFromHeaders(request: Request): { country: string; countryCode: string } {
  const code =
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("x-country-code") ||
    "XX";
  const upper = code.toUpperCase().slice(0, 2);
  const names: Record<string, string> = {
    VN: "Vietnam",
    US: "United States",
    JP: "Japan",
    KR: "South Korea",
    SG: "Singapore",
    TH: "Thailand",
    CN: "China",
    GB: "United Kingdom",
    DE: "Germany",
    FR: "France",
    AU: "Australia",
  };
  if (upper === "XX") return { country: "Unknown", countryCode: "XX" };
  return { country: names[upper] ?? upper, countryCode: upper };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      path?: string;
      sessionKey?: string;
    };

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anon";
    const ua = request.headers.get("user-agent") ?? "";
    const sessionKey =
      body.sessionKey?.slice(0, 64) ||
      createHash("sha256").update(`${ip}:${ua}`).digest("hex").slice(0, 32);

    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const recent = await prisma.siteVisit.findFirst({
      where: { sessionKey, createdAt: { gte: since } },
      select: { id: true },
    });
    if (recent) {
      return NextResponse.json({ ok: true, deduped: true });
    }

    const { country, countryCode } = countryFromHeaders(request);
    await prisma.siteVisit.create({
      data: {
        path: body.path?.slice(0, 512) ?? "/",
        country,
        countryCode,
        monthKey: monthKey(),
        sessionKey,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
