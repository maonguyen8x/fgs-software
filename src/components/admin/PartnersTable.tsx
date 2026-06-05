"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Partner } from "@prisma/client";
import { Building2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UploadImage } from "@/components/ui/UploadImage";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";
import { publishPublicSiteUpdate } from "@/lib/admin-public-sync";

interface PartnersTableProps {
  partners: Partner[];
}

export function PartnersTable({ partners }: PartnersTableProps) {
  const t = useTranslations("admin.partners");
  const router = useRouter();

  const handleDelete = async (partner: Partner) => {
    if (!window.confirm(t("delete_confirm", { name: partner.name }))) return;

    const res = await fetch(`/api/admin/partners/${partner.id}`, { method: "DELETE" });
    if (!res.ok) {
      showAdminErrorToast(t("delete_failed"));
      return;
    }

    showAdminSuccessToast(t("delete_success"));
    publishPublicSiteUpdate(router);
    router.refresh();
  };

  if (partners.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-16 text-center">
        <Building2 className="mb-3 h-10 w-10 text-slate-300" />
        <p className="text-sm text-slate-500">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">{t("col_logo")}</th>
              <th className="px-4 py-3">{t("col_name")}</th>
              <th className="px-4 py-3">{t("col_website")}</th>
              <th className="px-4 py-3">{t("col_order")}</th>
              <th className="px-4 py-3">{t("col_status")}</th>
              <th className="px-4 py-3 text-right">{t("col_actions")}</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => (
              <tr key={partner.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <div className="relative h-14 w-24 overflow-hidden rounded-lg border border-slate-100 bg-white">
                    {partner.logoUrl ? (
                      <UploadImage
                        src={partner.logoUrl}
                        alt={partner.name}
                        fill
                        className="object-contain p-1.5"
                        sizes="96px"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-lg font-bold text-primary-300">
                        {partner.name.charAt(0)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{partner.name}</p>
                  {partner.nameVi ? (
                    <p className="text-xs text-slate-500">{partner.nameVi}</p>
                  ) : null}
                </td>
                <td className="max-w-[180px] truncate px-4 py-3 text-slate-500">
                  {partner.websiteUrl ?? "—"}
                </td>
                <td className="px-4 py-3">{partner.order}</td>
                <td className="px-4 py-3">
                  <Badge variant={partner.isVisible ? "default" : "secondary"}>
                    {partner.isVisible ? t("visible") : t("hidden")}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm" className="cursor-pointer">
                      <Link href={`/admin/partners/${partner.id}`}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        {t("edit")}
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => void handleDelete(partner)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
