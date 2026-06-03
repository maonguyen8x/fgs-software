import { getSettingValue } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";

/** Legacy hero copy hidden on the homepage unless admin sets new text in Settings. */
export const LEGACY_HERO_TEXTS = new Set([
  "Đối tác Outsourcing IT đáng tin cậy tại Việt Nam",
  "Your trusted IT outsourcing partner in Vietnam",
  "Your Trusted IT Outsourcing Partner in Vietnam",
  "ベトナムの信頼できるITアウトソーシングパートナー",
  "Chúng tôi phát triển phần mềm chất lượng cao cho doanh nghiệp Nhật Bản",
  "We help businesses develop products and optimize operations through technology",
  "Chúng tôi giúp doanh nghiệp phát triển sản phẩm và tối ưu vận hành bằng công nghệ",
  "テクノロジーで企業のプロダクト成長と業務の最適化を支援します",
  "FGS Software delivers high-quality software development for Japanese businesses from Vietnam.",
  "日本企業向けに高品質なソフトウェアを開発します",
  "高品質なソフトウェアを開発します",
]);

export function sanitizeHeroText(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || LEGACY_HERO_TEXTS.has(trimmed)) return "";
  return trimmed;
}

export interface HeroDisplayCopy {
  headline: string;
  subheadline: string;
  showHeadline: boolean;
  showSubheadline: boolean;
  typewriterEnabled: boolean;
  typewriterTarget: "headline" | "subheadline";
}

export function resolveHeroDisplayCopy(
  settings: Record<string, string>,
  locale: Locale
): HeroDisplayCopy {
  const headline = sanitizeHeroText(getSettingValue(settings, "hero_headline", locale));
  const subheadline = sanitizeHeroText(
    getSettingValue(settings, "hero_subheadline", locale) ||
      getSettingValue(settings, "site_tagline", locale)
  );
  const typewriterEnabled = (settings.hero_typewriter_enabled ?? "true") !== "false";
  const typewriterTarget: "headline" | "subheadline" =
    headline && !subheadline ? "headline" : "subheadline";

  return {
    headline,
    subheadline,
    showHeadline: headline.length > 0,
    showSubheadline: subheadline.length > 0,
    typewriterEnabled,
    typewriterTarget,
  };
}
