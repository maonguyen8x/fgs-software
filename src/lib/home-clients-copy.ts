import { getSettingValue } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";

export const HOME_CLIENTS_TITLE_KEY = "home_clients_title";
export const HOME_CLIENTS_TITLE_VI_KEY = "home_clients_title_vi";
export const HOME_CLIENTS_TITLE_JA_KEY = "home_clients_title_ja";
export const HOME_CLIENTS_SUBTITLE_KEY = "home_clients_subtitle";
export const HOME_CLIENTS_SUBTITLE_VI_KEY = "home_clients_subtitle_vi";
export const HOME_CLIENTS_SUBTITLE_JA_KEY = "home_clients_subtitle_ja";

export function resolveHomeClientsCopy(
  settings: Record<string, string>,
  locale: Locale,
  fallbacks: { title: string; subtitle: string }
) {
  const title = getSettingValue(settings, "home_clients_title", locale) || fallbacks.title;
  const subtitle =
    getSettingValue(settings, "home_clients_subtitle", locale) || fallbacks.subtitle;
  return { title, subtitle };
}

export const HOME_CLIENTS_SETTING_KEYS = [
  HOME_CLIENTS_TITLE_KEY,
  HOME_CLIENTS_TITLE_VI_KEY,
  HOME_CLIENTS_TITLE_JA_KEY,
  HOME_CLIENTS_SUBTITLE_KEY,
  HOME_CLIENTS_SUBTITLE_VI_KEY,
  HOME_CLIENTS_SUBTITLE_JA_KEY,
] as const;
