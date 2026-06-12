export interface AdminSettingsPageDef {
  href: string;
  labelKey: string;
  descriptionKey: string;
}

export const ADMIN_SETTINGS_PAGES: AdminSettingsPageDef[] = [
  {
    href: "/admin/settings/site",
    labelKey: "settings_site",
    descriptionKey: "settings_site_desc",
  },
  {
    href: "/admin/settings/homepage",
    labelKey: "settings_homepage",
    descriptionKey: "settings_homepage_desc",
  },
  {
    href: "/admin/settings/about",
    labelKey: "settings_about",
    descriptionKey: "settings_about_desc",
  },
  {
    href: "/admin/settings/integrations",
    labelKey: "settings_integrations",
    descriptionKey: "settings_integrations_desc",
  },
  {
    href: "/admin/settings/security",
    labelKey: "settings_security",
    descriptionKey: "settings_security_desc",
  },
  {
    href: "/admin/settings/company",
    labelKey: "settings_company",
    descriptionKey: "settings_company_desc",
  },
];

export function isAdminSettingsPath(pathname: string): boolean {
  return (
    pathname === "/admin/settings" ||
    pathname.startsWith("/admin/settings/")
  );
}
