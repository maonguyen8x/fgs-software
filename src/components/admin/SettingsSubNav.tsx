"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ADMIN_SETTINGS_PAGES } from "@/config/admin-settings-nav";

export function SettingsSubNav() {
  const pathname = usePathname();
  const t = useTranslations("admin.sidebar");

  return (
    <nav
      className="mb-6 flex flex-wrap gap-2 rounded-xl border border-slate-200/80 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      aria-label="Settings sections"
    >
      {ADMIN_SETTINGS_PAGES.map((page) => {
        const active = pathname === page.href || pathname.startsWith(`${page.href}/`);
        return (
          <Link
            key={page.href}
            href={page.href}
            prefetch
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary-50 text-primary-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            {t(page.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
