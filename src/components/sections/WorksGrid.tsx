import { UploadImage } from "@/components/ui/UploadImage";
import { Link } from "@/i18n/navigation";
import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";

interface Work {
  id: string;
  slug: string;
  title: string;
  titleJa?: string | null;
  titleVi?: string | null;
  summary: string;
  summaryJa?: string | null;
  summaryVi?: string | null;
  thumbnail?: string | null;
  techStack: string[];
  category: string;
}

interface WorksGridProps {
  works: Work[];
  locale: Locale;
  viewLabel: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  web: "Web",
  mobile: "Mobile",
  api: "API",
  other: "Other",
};

export function WorksGrid({ works, locale, viewLabel }: WorksGridProps) {
  if (works.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">
        —
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {works.map((work) => {
        const title = getLocalizedField(work, "title", locale);
        const summary = getLocalizedField(work, "summary", locale);
        const categoryLabel = CATEGORY_LABELS[work.category] ?? work.category;

        return (
          <Link
            key={work.id}
            href={`/works/${work.slug}`}
            className="works-product-card group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-6px_rgba(15,23,42,0.1)] ring-1 ring-slate-100/90 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary-200/80 hover:shadow-[0_16px_40px_-10px_rgba(37,99,235,0.22)] dark:border-slate-700/90 dark:bg-slate-900 dark:ring-slate-800/80 dark:hover:border-primary-800/60"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-linear-to-br from-primary-100 to-slate-100 dark:from-primary-950 dark:to-slate-800">
              {work.thumbnail ? (
                <UploadImage
                  src={work.thumbnail}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-primary-400/80">
                  FGS
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-900/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            <div className="flex flex-1 flex-col p-4 md:p-5">
              <span className="mb-2 inline-flex w-fit rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                {categoryLabel}
              </span>
              <h3 className="line-clamp-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                {title}
              </h3>
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {summary}
              </p>
              {work.techStack.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {work.techStack.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-4 text-sm font-semibold text-primary-600 transition-colors group-hover:text-primary-800 dark:text-primary-400">
                {viewLabel} →
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
