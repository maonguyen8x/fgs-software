import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/layout/PageSection";
import { TeamGrid } from "@/components/sections/TeamGrid";
import type { Locale } from "@/i18n/routing";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("team");
  const loc = locale as Locale;

  const members = await prisma.teamMember.findMany({
    where: { isVisible: true },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <PageSection>
        <TeamGrid members={members} locale={loc} yearsLabel={t("years")} />
      </PageSection>
    </div>
  );
}
