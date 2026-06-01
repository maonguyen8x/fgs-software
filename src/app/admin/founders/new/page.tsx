import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FounderForm } from "@/components/admin/FounderForm";
import { Button } from "@/components/ui/button";

export default async function NewFounderPage() {
  const t = await getTranslations("admin.team");
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <Button asChild variant="outline" size="sm" className="cursor-pointer">
          <Link href="/admin/team?tab=founders">← {t("back")}</Link>
        </Button>
        <h1 className="text-2xl font-bold text-heading">{t("add_founder")}</h1>
      </div>
      <FounderForm />
    </div>
  );
}
