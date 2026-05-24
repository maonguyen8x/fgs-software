import type { TechStack } from "@prisma/client";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<
  string,
  { label: string; gradient: string; ring: string }
> = {
  frontend: {
    label: "Frontend",
    gradient: "from-sky-500/10 to-blue-500/5",
    ring: "ring-sky-200/80 dark:ring-sky-800/60",
  },
  backend: {
    label: "Backend",
    gradient: "from-violet-500/10 to-purple-500/5",
    ring: "ring-violet-200/80 dark:ring-violet-800/60",
  },
  mobile: {
    label: "Mobile",
    gradient: "from-emerald-500/10 to-teal-500/5",
    ring: "ring-emerald-200/80 dark:ring-emerald-800/60",
  },
  database: {
    label: "Database",
    gradient: "from-amber-500/10 to-orange-500/5",
    ring: "ring-amber-200/80 dark:ring-amber-800/60",
  },
  devops: {
    label: "DevOps",
    gradient: "from-rose-500/10 to-pink-500/5",
    ring: "ring-rose-200/80 dark:ring-rose-800/60",
  },
  tools: {
    label: "Tools",
    gradient: "from-slate-500/10 to-slate-400/5",
    ring: "ring-slate-200/80 dark:ring-slate-700/60",
  },
};

interface TechStackSectionProps {
  title: string;
  subtitle?: string;
  items: TechStack[];
  categories: readonly string[];
}

export function TechStackSection({ title, subtitle, items, categories }: TechStackSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="section-padding bg-surface-muted">
      <div className="container-narrow">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-heading">{title}</h2>
          {subtitle && <p className="mt-2 text-muted-theme">{subtitle}</p>}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const group = items.filter((t) => t.category === cat);
            if (group.length === 0) return null;
            const meta = CATEGORY_META[cat] ?? {
              label: cat,
              gradient: "from-primary-500/10 to-primary-400/5",
              ring: "ring-primary-200/80",
            };

            return (
              <div
                key={cat}
                className={cn("content-block p-5 ring-1", meta.ring)}
              >
                <div
                  className={cn(
                    "mb-4 inline-flex rounded-lg bg-gradient-to-br px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300",
                    meta.gradient
                  )}
                >
                  {meta.label}
                </div>
                <ul className="flex flex-wrap gap-2">
                  {group.map((tech) => (
                    <li
                      key={tech.id}
                      className="rounded-full border border-theme bg-surface-muted px-3 py-1.5 text-sm font-medium text-theme transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 dark:hover:border-primary-700 dark:hover:bg-primary-950/60 dark:hover:text-primary-200"
                    >
                      {tech.name}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
