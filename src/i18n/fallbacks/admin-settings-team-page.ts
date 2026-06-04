import type { Locale } from "@/i18n/routing";

export const ADMIN_SETTINGS_TEAM_PAGE_MESSAGES: Record<
  Locale,
  Record<string, string>
> = {
  vi: {
    title: "Trang Về chúng tôi",
    subtitle:
      "Ảnh nền đầu trang và liên kết quản lý ban lãnh đạo (hồ sơ hiển thị khi hover và trang chi tiết).",
    hero_image: "Ảnh nền (hero)",
    hero_hint:
      "Khuyến nghị ảnh ngang rộng, tối thiểu 1600×600px. Để trống sẽ dùng gradient mặc định.",
    manage_leaders: "Quản lý ban lãnh đạo",
    save: "Lưu trang Về chúng tôi",
    saving: "Đang lưu...",
    save_success: "Đã lưu cài đặt trang Về chúng tôi",
    save_failed: "Lưu thất bại",
  },
  en: {
    title: "About Us page",
    subtitle:
      "Hero background image and link to manage leadership profiles (hover popup and detail pages).",
    hero_image: "Background image (hero)",
    hero_hint:
      "Wide landscape image recommended, at least 1600×600px. Leave empty for the default gradient.",
    manage_leaders: "Manage leadership",
    save: "Save About Us page",
    saving: "Saving...",
    save_success: "About Us page settings saved",
    save_failed: "Save failed",
  },
  ja: {
    title: "私たちについてページ",
    subtitle:
      "ヒーロー背景画像とリーダーシップ管理（ホバー時のポップアップ・詳細ページ）。",
    hero_image: "背景画像（ヒーロー）",
    hero_hint:
      "横長の画像を推奨（1600×600px以上）。空欄の場合はデフォルトのグラデーションを表示します。",
    manage_leaders: "リーダーシップを管理",
    save: "ページ設定を保存",
    saving: "保存中...",
    save_success: "保存しました",
    save_failed: "保存に失敗しました",
  },
};
