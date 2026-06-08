import { getSettingValue } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";

export const ABOUT_BRANCH_HQ_ADDRESS_KEY = "about_branch_hq_address";
export const ABOUT_BRANCH_HQ_ADDRESS_VI_KEY = "about_branch_hq_address_vi";
export const ABOUT_BRANCH_HQ_ADDRESS_JA_KEY = "about_branch_hq_address_ja";

export function resolveAboutBranchHqAddress(
  settings: Record<string, string>,
  locale: Locale,
  fallback: string
): string {
  return getSettingValue(settings, ABOUT_BRANCH_HQ_ADDRESS_KEY, locale) || fallback;
}

export const ABOUT_BRANCH_SETTING_KEYS = [
  ABOUT_BRANCH_HQ_ADDRESS_KEY,
  ABOUT_BRANCH_HQ_ADDRESS_VI_KEY,
  ABOUT_BRANCH_HQ_ADDRESS_JA_KEY,
] as const;
