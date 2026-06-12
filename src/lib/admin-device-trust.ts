import { signAdminToken, verifyAdminToken } from "@/lib/admin-signed-token";

const DEVICE_TRUST_TTL_SECONDS = 90 * 24 * 60 * 60;
const LOGIN_PENDING_TTL_SECONDS = 5 * 60;

export function signDeviceTrustToken(userId: string, deviceId: string): string {
  return signAdminToken({ type: "device_trust", userId, deviceId }, DEVICE_TRUST_TTL_SECONDS);
}

export function verifyDeviceTrustToken(
  token: string,
  userId: string,
  deviceId: string
): boolean {
  const payload = verifyAdminToken<{ type: string; userId: string; deviceId: string }>(token);
  if (!payload || payload.type !== "device_trust") return false;
  return payload.userId === userId && payload.deviceId === deviceId;
}

export function signLoginPendingToken(
  userId: string,
  deviceId: string,
  rememberMe: boolean
): string {
  return signAdminToken(
    { type: "login_pending", userId, deviceId, rememberMe },
    LOGIN_PENDING_TTL_SECONDS
  );
}

export function verifyLoginPendingToken(
  token: string,
  deviceId: string
): { userId: string; rememberMe: boolean } | null {
  const payload = verifyAdminToken<{
    type: string;
    userId: string;
    deviceId: string;
    rememberMe?: boolean;
  }>(token);

  if (!payload || payload.type !== "login_pending") return null;
  if (payload.deviceId !== deviceId) return null;

  return {
    userId: payload.userId,
    rememberMe: payload.rememberMe === true,
  };
}
