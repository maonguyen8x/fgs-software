import { NextResponse } from "next/server";
import { z } from "zod";
import { timingSafeEqual } from "crypto";

const schema = z.object({
  hintKey: z.string().min(1).max(128),
});

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

/** Reveal seed login hints only when ADMIN_CREDENTIAL_HINT_KEY matches (not visible in page HTML). */
export async function POST(request: Request) {
  const configuredKey = process.env.ADMIN_CREDENTIAL_HINT_KEY?.trim();
  if (!configuredKey || configuredKey.length < 8) {
    return NextResponse.json({ error: "Login hints are not configured" }, { status: 503 });
  }

  try {
    const { hintKey } = schema.parse(await request.json());
    if (!safeEqual(hintKey.trim(), configuredKey)) {
      return NextResponse.json({ error: "Invalid hint key" }, { status: 403 });
    }

    return NextResponse.json({
      email: process.env.ADMIN_DEFAULT_EMAIL?.trim() || "admin@fgs-software.com",
      password: process.env.ADMIN_DEFAULT_PASSWORD?.trim() || "",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
