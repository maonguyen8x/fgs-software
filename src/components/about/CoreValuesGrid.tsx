import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import type { CoreValue } from "@prisma/client";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CoreValuesGridProps {
  title: string;
  items: CoreValue[];
  locale: Locale;
}

function resolveIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  return icons[name] ?? LucideIcons.Star;
}

export function CoreValuesGrid({ title, items, locale }: CoreValuesGridProps) {
  if (items.length === 0) return null;

  return (
    <section className="section-padding bg-slate-50">
      <div className="container-narrow">
        <h2 className="mb-10 text-center text-3xl font-bold text-slate-900">{title}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = resolveIcon(item.icon);
            return (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {getLocalizedField(item, "title", locale)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {getLocalizedField(item, "description", locale)}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
