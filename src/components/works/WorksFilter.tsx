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
    <div className="flex flex-wrap justify-center gap-2">
      {categories.map((cat) => (
        <Link
          key={cat}
          href={cat === "all" ? `/${locale}/works` : `/${locale}/works?category=${cat}`}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-all",
            currentCategory === cat
              ? "bg-primary-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-primary-50"
          )}
        >
          {labels[cat]}
        </Link>
      ))}
    </div>
  );
}
