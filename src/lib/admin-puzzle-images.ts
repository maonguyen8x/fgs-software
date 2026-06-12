const PUZZLE_WIDTH = 320;
const PUZZLE_HEIGHT = 180;

/** Locked loremflickr URLs — dogs, cats, and nature (stable per index). */
const PUZZLE_SUBJECTS = [
  "dog",
  "cat",
  "kitten",
  "puppy",
  "bird",
  "fox",
  "rabbit",
  "nature",
] as const;

export const PUZZLE_PIECE_SIZE = 48;
export const PUZZLE_CANVAS_WIDTH = PUZZLE_WIDTH;
export const PUZZLE_CANVAS_HEIGHT = PUZZLE_HEIGHT;
export const PUZZLE_IMAGE_COUNT = PUZZLE_SUBJECTS.length * 3;

export function getPuzzleImageUrl(imageIndex: number): string {
  const subject = PUZZLE_SUBJECTS[imageIndex % PUZZLE_SUBJECTS.length]!;
  const lock = Math.floor(imageIndex / PUZZLE_SUBJECTS.length) + 1;
  return `https://loremflickr.com/${PUZZLE_WIDTH}/${PUZZLE_HEIGHT}/${subject}?lock=${lock}`;
}

export function pickRandomPuzzleImageIndex(): number {
  return Math.floor(Math.random() * PUZZLE_IMAGE_COUNT);
}
