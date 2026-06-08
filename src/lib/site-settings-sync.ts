import type { Locale } from "@/i18n/routing";

export const SITE_SETTINGS_STORAGE_KEY = "fgs-site-settings-changed";

export type SiteSettingsSyncPayload = {
  type: "site-settings";
  at: string;
  defaultLocale?: Locale;
};

/** Notify all open tabs (public site + admin) that site notice / maintenance settings changed. */
export function notifySiteSettingsChange(options?: { defaultLocale?: Locale }): void {
  if (typeof window === "undefined") return;
  const stamp = String(Date.now());
  const payload: SiteSettingsSyncPayload = {
    type: "site-settings",
    at: stamp,
    ...(options?.defaultLocale ? { defaultLocale: options.defaultLocale } : {}),
  };

  try {
    localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* private mode */
  }
  try {
    const channel = new BroadcastChannel("fgs-site");
    channel.postMessage(payload);
    channel.close();
  } catch {
    /* unsupported */
  }
}
