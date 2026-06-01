import { BRAND } from "@/config/brand";

export type LogoDisplayMode = "text" | "image";

export const LOGO_MODE_KEY = "site_logo_mode";
export const LOGO_URL_KEY = "site_logo_url";
export const LOGO_BACKUP_KEY = "site_logo_url_backup";

export function resolveLogoDisplay(settings: Record<string, string>): {
  mode: LogoDisplayMode;
  url: string | null;
} {
  const modeSetting = settings[LOGO_MODE_KEY]?.trim();
  const customUrl = settings[LOGO_URL_KEY]?.trim();

  if (modeSetting === "text") {
    return { mode: "text", url: null };
  }

  if (modeSetting === "image" && customUrl) {
    return { mode: "image", url: customUrl };
  }

  return { mode: "image", url: BRAND.logoPngPath };
}
