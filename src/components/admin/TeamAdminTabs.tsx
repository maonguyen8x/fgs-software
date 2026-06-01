"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type TeamAdminTab = "members" | "founders";

export function TeamAdminTabs({ active }: { active: TeamAdminTab }) {
  const t = useTranslations("admin.team");

  const tabs: { id: TeamAdminTab; href: string }[] = [
    { id: "members", href: "/admin/team" },
    { id: "founders", href: "/admin/team?tab=founders" },
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b border-theme pb-4">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
            active === tab.id
              ? "bg-primary-600 text-white shadow-sm"
              : "bg-surface-muted text-slate-600 hover:bg-primary-50 hover:text-primary-700"
          )}
        >
          {t(`tab_${tab.id}`)}
        </Link>
      ))}
    </div>
  );
}
