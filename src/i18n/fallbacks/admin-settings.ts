import type { Locale } from "@/i18n/routing";
import { ADMIN_SETTINGS_TEAM_PAGE_MESSAGES } from "@/i18n/fallbacks/admin-settings-team-page";

const LOCALE_PANEL_FALLBACK: Record<Locale, Record<string, string>> = {
  vi: {
    title: "Đa ngôn ngữ (EN / JA / VI)",
    subtitle: "Bật ngôn ngữ và chỉnh tagline trang theo từng ngôn ngữ.",
    default_locale: "Ngôn ngữ mặc định website",
    default_locale_hint:
      "Áp dụng khi khách truy cập lần đầu (trước khi chọn ngôn ngữ). Lưu để cập nhật toàn site.",
    lang_en: "Tiếng Anh",
    lang_ja: "Tiếng Nhật",
    lang_vi: "Tiếng Việt",
    visible_on_site: "Hiển thị trên website",
    crud_hint: "Quản lý nội dung: dùng Team, Services, Works, Blog, About trên menu trái.",
    save: "Lưu ngôn ngữ",
    saving: "Đang lưu...",
    save_success: "Đã lưu cài đặt ngôn ngữ",
    save_failed: "Lưu thất bại",
    manage_services: "Quản lý bản dịch dịch vụ",
  },
  en: {
    title: "Multilingual (EN / JA / VI)",
    subtitle: "Enable locales and edit shared site taglines per language.",
    default_locale: "Default website language",
    default_locale_hint:
      "Used for first-time visitors before they pick a language. Saves apply site-wide.",
    lang_en: "English",
    lang_ja: "Japanese",
    lang_vi: "Vietnamese",
    visible_on_site: "Visible on website",
    crud_hint: "Content CRUD: use Team, Services, Works, Blog, About sections in the sidebar.",
    save: "Save languages",
    saving: "Saving...",
    save_success: "Language settings saved",
    save_failed: "Save failed",
    manage_services: "Manage service translations",
  },
  ja: {
    title: "多言語 (EN / JA / VI)",
    subtitle: "言語の有効化とタグラインの編集。",
    default_locale: "サイトのデフォルト言語",
    default_locale_hint:
      "初回訪問時（言語未選択時）に適用されます。保存するとサイト全体に反映されます。",
    lang_en: "英語",
    lang_ja: "日本語",
    lang_vi: "ベトナム語",
    visible_on_site: "サイトに表示",
    crud_hint: "コンテンツ管理: 左メニューの Team, Services, Works, Blog, About を使用。",
    save: "保存",
    saving: "保存中...",
    save_success: "言語設定を保存しました",
    save_failed: "保存に失敗しました",
    manage_services: "サービス翻訳を管理",
  },
};

function mergeSection(
  existing: Record<string, unknown> | undefined,
  fallback: Record<string, string>
): Record<string, string> {
  return { ...fallback, ...(existing as Record<string, string> | undefined) };
}

/** Merge admin.settings fallbacks so new keys always resolve in admin UI. */
export function mergeAdminSettingsMessages(
  messages: Record<string, unknown>,
  locale: Locale
): Record<string, unknown> {
  const admin = (messages.admin ?? {}) as Record<string, unknown>;
  const settings = (admin.settings ?? {}) as Record<string, unknown>;

  return {
    ...messages,
    admin: {
      ...admin,
      settings: {
        ...settings,
        locale_panel: mergeSection(
          settings.locale_panel as Record<string, unknown> | undefined,
          LOCALE_PANEL_FALLBACK[locale]
        ),
        team_page: mergeSection(
          settings.team_page as Record<string, unknown> | undefined,
          ADMIN_SETTINGS_TEAM_PAGE_MESSAGES[locale]
        ),
      },
    },
  };
}
