export type AdminSettingsSectionGroup = "panels" | "content" | "form";

export interface AdminSettingsSection {
  id: string;
  labelKey: string;
  group: AdminSettingsSectionGroup;
}

export const ADMIN_SETTINGS_SECTIONS: AdminSettingsSection[] = [
  { id: "settings-logo", labelKey: "logo", group: "panels" },
  { id: "settings-hero-slides", labelKey: "hero_slides", group: "panels" },
  { id: "settings-clients", labelKey: "clients_section", group: "panels" },
  { id: "settings-team-page", labelKey: "team_page", group: "panels" },
  { id: "settings-about-branch", labelKey: "about_branch", group: "panels" },
  { id: "settings-about-activities", labelKey: "about_activities", group: "panels" },
  { id: "settings-site-notice", labelKey: "site_notice", group: "panels" },
  { id: "settings-header-nav", labelKey: "header_nav", group: "panels" },
  { id: "settings-locale", labelKey: "locale_panel", group: "panels" },
  { id: "settings-theme", labelKey: "theme", group: "panels" },
  { id: "settings-ai-providers", labelKey: "ai_providers", group: "panels" },
  { id: "settings-email", labelKey: "email", group: "panels" },
  { id: "settings-page-content", labelKey: "page_content", group: "content" },
  { id: "settings-company", labelKey: "company", group: "form" },
  { id: "settings-social", labelKey: "social", group: "form" },
  { id: "settings-seo", labelKey: "seo", group: "form" },
  { id: "settings-hero", labelKey: "hero", group: "form" },
  { id: "settings-chatbot", labelKey: "chatbot", group: "form" },
  { id: "settings-pageHeaderColors", labelKey: "page_header_colors", group: "form" },
  { id: "settings-maps", labelKey: "maps", group: "form" },
];

export const ADMIN_SETTINGS_SCROLL_OFFSET = "scroll-mt-24";
