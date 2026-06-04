import type { Locale } from "@/i18n/routing";

/** Ensures newer `works.*` keys exist even if a locale JSON bundle is stale. */
export const WORKS_MESSAGES_FALLBACK: Record<Locale, Record<string, string>> = {
  vi: {
    title: "Portfolio",
    subtitle: "CÁC SẢN PHẨM ĐÃ PHÁT TRIỂN",
    filter_all: "Tất cả",
    filter_web: "Web",
    filter_mobile: "Mobile",
    filter_api: "API",
    filter_other: "Khác",
    view_details: "Xem chi tiết",
    back_to_list: "Quay lại danh sách sản phẩm",
    gallery_title: "Hình ảnh sản phẩm",
    challenge: "Thách thức",
    solution: "Giải pháp",
    result: "Kết quả",
    duration: "Thời gian",
    demo: "Demo",
    github: "Mã nguồn",
  },
  en: {
    title: "Portfolio",
    subtitle: "PRODUCTS WE HAVE DEVELOPED",
    filter_all: "All",
    filter_web: "Web",
    filter_mobile: "Mobile",
    filter_api: "API",
    filter_other: "Other",
    view_details: "View Details",
    back_to_list: "Back to products",
    gallery_title: "Product gallery",
    challenge: "Challenge",
    solution: "Solution",
    result: "Result",
    duration: "Duration",
    demo: "Live Demo",
    github: "Source Code",
  },
  ja: {
    title: "制作実績",
    subtitle: "開発した製品一覧",
    filter_all: "すべて",
    filter_web: "Web",
    filter_mobile: "モバイル",
    filter_api: "API",
    filter_other: "その他",
    view_details: "詳細を見る",
    back_to_list: "製品一覧に戻る",
    gallery_title: "製品ギャラリー",
    challenge: "課題",
    solution: "解決策",
    result: "結果",
    duration: "期間",
    demo: "デモ",
    github: "ソースコード",
  },
};

export function mergeWorksMessages(
  messages: Record<string, unknown>,
  locale: Locale
): Record<string, unknown> {
  const works = (messages.works ?? {}) as Record<string, string>;
  const fallback = WORKS_MESSAGES_FALLBACK[locale];

  return {
    ...messages,
    works: { ...fallback, ...works },
  };
}
