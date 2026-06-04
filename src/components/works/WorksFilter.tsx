"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const categories = ["all", "web", "mobile", "api", "other"] as const;

export function WorksFilter({
  locale,
  currentCategory,
}: {
  locale: string;
  currentCategory: string;
}) {
  const t = useTranslations("works");

  const labels: Record<string, string> = {
    all: t("filter_all"),
    web: t("filter_web"),
    mobile: t("filter_mobile"),
    api: t("filter_api"),
    other: t("filter_other"),
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-2.5">
      {categories.map((cat) => (
        <Link
          key={cat}
          href={cat === "all" ? `/${locale}/works` : `/${locale}/works?category=${cat}`}
          className={cn(
            "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
            currentCategory === cat
              ? "border-primary-500 bg-primary-600 text-white shadow-md shadow-primary-600/25"
              : "border-slate-200/90 bg-white text-slate-600 shadow-sm hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-primary-700 dark:hover:bg-primary-950/50"
          )}
        >
          {labels[cat]}
        </Link>
      ))}
    </div>
  );
}
