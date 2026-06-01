"use client";

import { useTranslations } from "next-intl";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export function AdminSettingsPageIntro() {
  const t = useTranslations("admin.settings.page");
  return (
    <AdminPageHeader
      title={t("title")}
      description={t("description")}
      backHref="/admin/dashboard"
    />
  );
}
