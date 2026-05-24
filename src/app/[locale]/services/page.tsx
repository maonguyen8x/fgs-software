import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/layout/PageSection";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { TechStackSection } from "@/components/sections/TechStackSection";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");
  const loc = locale as Locale;

  const [services, techStack] = await Promise.all([
    prisma.service.findMany({ where: { isVisible: true }, orderBy: { order: "asc" } }),
    prisma.techStack.findMany({ where: { isVisible: true }, orderBy: { order: "asc" } }),
  ]);

  const categories = ["frontend", "backend", "mobile", "database", "devops", "tools"] as const;

  return (
    <div>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <PageSection>
        <ServicesGrid
          services={services}
          locale={loc}
          contactHref={`/${locale}/contact`}
          learnMoreLabel={t("contact_cta")}
        />
      </PageSection>

      <TechStackSection
        title={t("tech_title")}
        subtitle={t("tech_subtitle")}
        items={techStack}
        categories={categories}
      />

      <PageSection className="text-center">
        <Button asChild size="lg" className="cursor-pointer">
          <Link href={`/${locale}/contact`}>{t("contact_cta")}</Link>
        </Button>
      </PageSection>
    </div>
  );
}
