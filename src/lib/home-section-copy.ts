/** Subtitles hidden on the homepage (legacy / placeholder copy). */
export const HIDDEN_HOME_SUBTITLES = new Set([
  "Đối tác đáng tin cậy cho dự án thị trường Nhật Bản",
  "Your trusted partner for Japan-market projects",
  "ベトナム市場向けプロジェクトの信頼できるパートナー",
  "why_subtitle",
]);

export function sanitizeHomeSectionSubtitle(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed || HIDDEN_HOME_SUBTITLES.has(trimmed)) return undefined;
  return trimmed;
}
