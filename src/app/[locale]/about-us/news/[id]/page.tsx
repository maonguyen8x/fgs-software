import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import { UploadImage } from "@/components/ui/UploadImage";
import { NewsArticleContent } from "@/components/news/NewsArticleContent";

export const dynamic = "force-dynamic";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations("news");

  const item = await prisma.newsArticle.findFirst({ where: { id, status: "active" } });
  if (!item) notFound();

  const title = getLocalizedField(item, "title", loc);
  const summary = getLocalizedField(item, "summary", loc);
  const content = getLocalizedField(item, "content", loc);
  const date = new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : locale === "vi" ? "vi-VN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(item.createdAt);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <Link
        href="/about-us/news"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t("back")}
      </Link>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {item.imageUrl && (
          <div className="relative aspect-[16/8] bg-slate-100">
            <UploadImage src={item.imageUrl} alt={title} fill priority className="object-cover" sizes="768px" />
          </div>
        )}
        <div className="p-6 md:p-10">
          <h1 className="text-2xl font-bold leading-tight text-heading md:text-3xl">{title}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 text-sm text-muted-theme">
            <span>{date}</span>
            <span aria-hidden>•</span>
            <span>{t("by", { name: item.authorName })}</span>
          </p>
          <p className="mt-6 text-lg font-medium leading-relaxed text-slate-700">{summary}</p>
          <NewsArticleContent content={content} />
        </div>
      </div>
    </article>
  );
}
