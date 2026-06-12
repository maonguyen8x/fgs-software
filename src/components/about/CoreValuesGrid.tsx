import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import type { CoreValue } from "@prisma/client";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Gem } from "lucide-react";
import { TeamSectionHeading } from "@/components/team/TeamSectionHeading";

interface CoreValuesGridProps {
  title: string;
  items: CoreValue[];
  locale: Locale;
  /** Compact left-aligned layout for the About Us (team) page */
  variant?: "default" | "team";
}

function resolveIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  return icons[name] ?? LucideIcons.Star;
}

export function CoreValuesGrid({ title, items, locale, variant = "default" }: CoreValuesGridProps) {
  if (items.length === 0) return null;

  const isTeam = variant === "team";

  return (
    <section
      className={
        isTeam
          ? "team-flow-section team-flow-section--balanced bg-slate-50/80 dark:bg-slate-900/40"
          : "page-section !py-3 bg-slate-50 dark:bg-slate-950"
      }
    >
      <div className={isTeam ? "team-page-inner" : "container-narrow"}>
        {isTeam ? (
          <TeamSectionHeading icon={Gem} title={title} className="team-section-heading max-w-none" />
        ) : (
          <h2 className="about-emphasis-heading">{title}</h2>
        )}
        <div className={isTeam ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"}>
          {items.map((item) => {
            const Icon = resolveIcon(item.icon);
            return (
              <article
                key={item.id}
                className={`rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:shadow-none dark:hover:bg-slate-800/90${isTeam ? " text-left" : ""}`}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400">
                  <Icon className="h-6 w-6" />
                </div>
                <h3
                  className={
                    isTeam ? "text-lg font-bold text-slate-900 md:text-xl dark:text-white" : "text-lg font-bold text-slate-900 dark:text-slate-100"
                  }
                >
                  {getLocalizedField(item, "title", locale)}
                </h3>
                <p
                  className={
                    isTeam
                      ? "mt-2 text-base leading-relaxed text-slate-600 dark:text-slate-400"
                      : "mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400"
                  }
                >
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
