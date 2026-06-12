import { NextResponse } from "next/server";
import {
  getPuzzleImageUrl,
  pickRandomPuzzleImageIndex,
  PUZZLE_CANVAS_HEIGHT,
  PUZZLE_CANVAS_WIDTH,
  PUZZLE_PIECE_SIZE,
} from "@/lib/admin-puzzle-images";
import { signAdminToken } from "@/lib/admin-signed-token";

const MIN_X = 56;
const MAX_X = PUZZLE_CANVAS_WIDTH - PUZZLE_PIECE_SIZE - 16;
const MAX_TRAVEL = PUZZLE_CANVAS_WIDTH - PUZZLE_PIECE_SIZE;

type PuzzleMode = "slice" | "flip";

export async function GET() {
  const imageIndex = pickRandomPuzzleImageIndex();
  const mode: PuzzleMode = Math.random() < 0.5 ? "slice" : "flip";
  const targetX = Math.floor(MIN_X + Math.random() * (MAX_X - MIN_X));
  const targetRatio = targetX / MAX_TRAVEL;
  const pieceY =
    mode === "slice"
      ? Math.floor(24 + Math.random() * (PUZZLE_CANVAS_HEIGHT - PUZZLE_PIECE_SIZE - 32))
      : 0;

  const challengeToken = signAdminToken(
    { type: "puzzle", mode, targetRatio, pieceY, imageIndex },
    10 * 60
  );

  return NextResponse.json({
    challengeToken,
    mode,
    imageUrl: getPuzzleImageUrl(imageIndex),
    targetRatio,
    pieceY,
    pieceSize: PUZZLE_PIECE_SIZE,
    width: PUZZLE_CANVAS_WIDTH,
    height: PUZZLE_CANVAS_HEIGHT,
    maxTravel: MAX_TRAVEL,
  });
}
