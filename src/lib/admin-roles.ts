export const ADMIN_ROLE = "admin" as const;
export const SUPER_ADMIN_ROLE = "super_admin" as const;

export type AdminRole = typeof ADMIN_ROLE | typeof SUPER_ADMIN_ROLE;

export function isSuperAdminRole(role: string | undefined | null): boolean {
  return role === SUPER_ADMIN_ROLE;
}
