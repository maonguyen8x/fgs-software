import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { getLocalizedField } from "@/lib/i18n-content";

interface Item {
  id: string;
  icon: string;
  title: string;
  titleJa?: string | null;
  titleVi?: string | null;
  description: string;
  descriptionJa?: string | null;
  descriptionVi?: string | null;
}

interface WhyChooseUsProps {
  items: Item[];
  locale: Locale;
}

export function WhyChooseUs({ items, locale }: WhyChooseUsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-5">
      {items.map((item) => {
        const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
        const Icon = icons[item.icon] ?? LucideIcons.Star;
        return (
          <div key={item.id} className="group content-block flex gap-3 md:gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 transition-colors duration-300 group-hover:bg-primary-600 group-hover:text-white dark:bg-primary-950 dark:text-primary-300">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-heading">{getLocalizedField(item, "title", locale)}</h3>
              <p className="content-prose-tight mt-1">{getLocalizedField(item, "description", locale)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
