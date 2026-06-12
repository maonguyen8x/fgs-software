import { NextResponse } from "next/server";
import { z } from "zod";
import { signAdminToken, verifyAdminToken } from "@/lib/admin-signed-token";

const schema = z.object({
  challengeToken: z.string().min(1),
  sliderRatio: z.number().min(0).max(1),
});

/** Allow ~5% of track or 10px equivalent — accounts for touch / rounding. */
const RATIO_TOLERANCE = 0.05;

export async function POST(request: Request) {
  try {
    const { challengeToken, sliderRatio } = schema.parse(await request.json());
    const payload = verifyAdminToken<{
      type: string;
      mode?: string;
      targetRatio: number;
      pieceY: number;
      imageIndex: number;
    }>(challengeToken);

    if (!payload || payload.type !== "puzzle") {
      return NextResponse.json({ error: "invalid_puzzle" }, { status: 400 });
    }

    const delta = Math.abs(sliderRatio - payload.targetRatio);
    if (delta > RATIO_TOLERANCE) {
      return NextResponse.json({ error: "puzzle_mismatch", delta }, { status: 400 });
    }

    const passToken = signAdminToken({ type: "captcha_pass", nonce: crypto.randomUUID() }, 15 * 60);
    return NextResponse.json({ passToken });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}
