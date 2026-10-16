"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePublicPath } from "@/components/providers/PublicPathsProvider";
import { getWorkCategoryIcon } from "@/components/works/work-categories";

export interface WorksFilterItem {
  key: string;
  label: string;
  count: number;
}

export function WorksFilter({
  locale,
  currentCategory,
  items,
}: {
  locale: string;
  currentCategory: string;
  items: WorksFilterItem[];
}) {
  const listPath = `/${locale}${usePublicPath("/works")}`;

  return (
    <div className="works-filter-bar">
      <div className="works-filter-track">
        {items.map((item) => {
          const Icon = getWorkCategoryIcon(item.key);
          const active = currentCategory === item.key;
          return (
            <Link
              key={item.key}
              href={item.key === "all" ? listPath : `${listPath}?category=${item.key}`}
              scroll={false}
              className={cn("works-filter-chip", active && "is-active")}
              aria-current={active ? "true" : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span>{item.label}</span>
              <b>{item.count}</b>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
