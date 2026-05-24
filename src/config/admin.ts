/**
 * Admin access configuration (server-only).
 * Set ADMIN_LOGIN_PATH in .env to hide the default /admin/login URL.
 * Example: ADMIN_LOGIN_PATH=fgs-portal-k9m2 → login at /access/fgs-portal-k9m2
 */
export function getAdminLoginSecret(): string | null {
  const secret = process.env.ADMIN_LOGIN_PATH?.trim();
  return secret && secret.length >= 8 ? secret : null;
}

export function getAdminLoginUrl(): string {
  const secret = getAdminLoginSecret();
  return secret ? `/access/${secret}` : "/admin/login";
}

export function isDefaultAdminLoginDisabled(): boolean {
  return getAdminLoginSecret() !== null;
}

export function isValidAdminAccessPath(pathname: string): boolean {
  const secret = getAdminLoginSecret();
  if (!secret) return pathname === "/admin/login";
  return pathname === `/access/${secret}`;
}
