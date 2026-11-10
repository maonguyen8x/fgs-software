import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LayoutGrid, List } from "lucide-react";
import { prisma } from "@/lib/db";
import { getNewsPageSize } from "@/lib/news";
import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import { UploadImage } from "@/components/ui/UploadImage";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ view?: string; page?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations("news");
  const { view, page } = await searchParams;
  const layout = view === "grid" ? "grid" : "list";

  const pageSize = await getNewsPageSize();
  const where = { status: "active" as const };
  const total = await prisma.newsArticle.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, Number(page) || 1), totalPages);

  const items = await prisma.newsArticle.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  const dateFormatter = new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : locale === "vi" ? "vi-VN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const pageHref = (p: number) => `?view=${layout}&page=${p}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-heading md:text-4xl">{t("title")}</h1>
          <p className="mt-2 text-sm text-muted-theme">{t("subtitle")}</p>
        </div>
        <div className="inline-flex overflow-hidden rounded-full border border-slate-200 bg-white p-1 text-sm">
          <Link
            href={`?view=list&page=${currentPage}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors",
              layout === "list" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <List className="h-4 w-4" aria-hidden />
            {t("view_list")}
          </Link>
          <Link
            href={`?view=grid&page=${currentPage}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors",
              layout === "grid" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden />
            {t("view_grid")}
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          {t("empty")}
        </p>
      ) : (
        <ul className={cn(layout === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-5")}>
          {items.map((item) => {
            const title = getLocalizedField(item, "title", loc);
            const summary = getLocalizedField(item, "summary", loc);
            return (
              <li key={item.id}>
              <Link
                href={`/about-us/news/${item.id}`}
                className={cn(
                  "group block h-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg",
                  layout === "list" && "sm:flex"
                )}
              >
                <div
                  className={cn(
                    "relative bg-gradient-to-br from-blue-100 to-slate-200",
                    layout === "list" ? "aspect-[16/9] sm:aspect-auto sm:w-64 sm:shrink-0" : "aspect-[16/9]"
                  )}
                >
                  {item.imageUrl ? (
                    <UploadImage src={item.imageUrl} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 320px" />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <h2 className="text-lg font-bold leading-snug text-heading transition-colors group-hover:text-blue-600">{title}</h2>
                  <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{summary}</p>
                  <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-theme">
                    <span>{dateFormatter.format(item.createdAt)}</span>
                    <span aria-hidden>•</span>
                    <span>{t("by", { name: item.authorName })}</span>
                  </p>
                </div>
              </Link>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <nav aria-label={t("pagination")} className="mt-12 flex items-center justify-center gap-2 text-sm">
          {currentPage > 1 && (
            <Link href={pageHref(currentPage - 1)} className="rounded-full border px-4 py-2 hover:bg-slate-50">
              {t("prev")}
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={cn(
                "h-9 w-9 rounded-full text-center leading-9",
                p === currentPage ? "bg-blue-600 font-semibold text-white" : "border hover:bg-slate-50"
              )}
            >
              {p}
            </Link>
          ))}
          {currentPage < totalPages && (
            <Link href={pageHref(currentPage + 1)} className="rounded-full border px-4 py-2 hover:bg-slate-50">
              {t("next")}
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
