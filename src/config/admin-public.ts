const publicPath = process.env.NEXT_PUBLIC_ADMIN_LOGIN_PATH?.trim();

export function getPublicAdminLoginUrl(): string {
  return publicPath && publicPath.length >= 8 ? `/access/${publicPath}` : "/admin/login";
}
