import { ADMIN_DEVICE_ID_KEY, ADMIN_DEVICE_TRUST_KEY } from "@/config/admin-auth";

const DEVICE_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidDeviceId(id: string | null | undefined): id is string {
  return Boolean(id && DEVICE_ID_RE.test(id));
}

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(ADMIN_DEVICE_ID_KEY);
    if (!isValidDeviceId(id)) {
      id = crypto.randomUUID();
      localStorage.setItem(ADMIN_DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function getDeviceTrustToken(email: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_DEVICE_TRUST_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, string>;
    return map[email.trim().toLowerCase()] ?? null;
  } catch {
    return null;
  }
}

export function clearDeviceTrustToken(email: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = email.trim().toLowerCase();
    const raw = localStorage.getItem(ADMIN_DEVICE_TRUST_KEY);
    if (!raw) return;
    const map = JSON.parse(raw) as Record<string, string>;
    delete map[key];
    localStorage.setItem(ADMIN_DEVICE_TRUST_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function setDeviceTrustToken(email: string, token: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = email.trim().toLowerCase();
    const raw = localStorage.getItem(ADMIN_DEVICE_TRUST_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[key] = token;
    localStorage.setItem(ADMIN_DEVICE_TRUST_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota / private mode */
  }
}
