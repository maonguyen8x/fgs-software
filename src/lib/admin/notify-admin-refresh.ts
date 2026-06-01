export const ADMIN_REFRESH_STORAGE_KEY = "fgs-admin-data-changed";

/** Notify other open admin tabs to refresh server-rendered data. */
export function notifyAdminRefresh(): void {
  if (typeof window === "undefined") return;
  const stamp = String(Date.now());
  try {
    localStorage.setItem(ADMIN_REFRESH_STORAGE_KEY, stamp);
  } catch {
    /* private mode */
  }
  try {
    const channel = new BroadcastChannel("fgs-admin");
    channel.postMessage({ type: "refresh", at: stamp });
    channel.close();
  } catch {
    /* unsupported */
  }
}
