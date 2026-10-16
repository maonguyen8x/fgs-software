export const HOME_CHAPTER_COUNT = 5;

export const HOME_HASH_HERO = "hero";

export const HOME_CHAPTER_IDS = [
  "chapter-01",
  "chapter-02",
  "chapter-03",
  "chapter-04",
  "chapter-05",
] as const;

export type HomeChapterId = (typeof HOME_CHAPTER_IDS)[number];

export function chapterIndex(id: HomeChapterId): number {
  return HOME_CHAPTER_IDS.indexOf(id);
}

export function chapterProgressPercent(index: number): number {
  return Math.round(((index + 1) / HOME_CHAPTER_COUNT) * 100);
}
