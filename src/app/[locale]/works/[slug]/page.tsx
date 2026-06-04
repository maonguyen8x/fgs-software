import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db";
import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import { WorkDetailContent } from "@/components/works/WorkDetailContent";

function collectWorkImages(thumbnail: string | null, gallery: string[]): string[] {
  const seen = new Set<string>();
  const list: string[] = [];
  for (const url of [thumbnail, ...gallery]) {
    const trimmed = url?.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    list.push(trimmed);
  }
  return list;
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("works");
  const loc = locale as Locale;

  const work = await prisma.work.findFirst({
    where: { slug, isVisible: true },
  });
  if (!work) notFound();

  const images = collectWorkImages(work.thumbnail, work.gallery);

  return (
    <div className="bg-linear-to-b from-indigo-50/40 via-white to-slate-50/80 pb-12 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="container-narrow px-4 py-6 md:py-8">
        <WorkDetailContent
          work={work}
          locale={loc}
          images={images}
          labels={{
            back: t("back_to_list"),
            duration: t("duration"),
            demo: t("demo"),
            github: t("github"),
            gallery: t("gallery_title"),
          }}
        />
      </div>
    </div>
  );
}
