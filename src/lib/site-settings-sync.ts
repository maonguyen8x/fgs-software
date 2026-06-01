export const SITE_SETTINGS_STORAGE_KEY = "fgs-site-settings-changed";

/** Notify all open tabs (public site + admin) that site notice / maintenance settings changed. */
export function notifySiteSettingsChange(): void {
  if (typeof window === "undefined") return;
  const stamp = String(Date.now());
  try {
    localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, stamp);
  } catch {
    /* private mode */
  }
  try {
    const channel = new BroadcastChannel("fgs-site");
    channel.postMessage({ type: "site-settings", at: stamp });
    channel.close();
  } catch {
    /* unsupported */
  }
}
