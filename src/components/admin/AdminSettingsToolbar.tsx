"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPublicAdminLoginUrl } from "@/config/admin-public";

export function AdminSettingsToolbar() {
  const t = useTranslations("admin.settings");

  return (
    <div className="mb-6 flex justify-end">
      <Button
        type="button"
        variant="outline"
        className="cursor-pointer gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950/40"
        onClick={() => signOut({ callbackUrl: getPublicAdminLoginUrl() })}
      >
        <LogOut className="h-4 w-4" />
        {t("logout")}
      </Button>
    </div>
  );
}
