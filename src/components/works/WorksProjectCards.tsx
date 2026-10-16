import { ArrowUpRight } from "lucide-react";
import type { Work } from "@prisma/client";
import { UploadImage } from "@/components/ui/UploadImage";
import { Link } from "@/i18n/navigation";
import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import { WORK_CATEGORY_GRADIENTS, getWorkCategoryIcon } from "@/components/works/work-categories";

interface WorksProjectCardsProps {
  works: Work[];
  locale: Locale;
  viewLabel: string;
  categoryLabels: Record<string, string>;
}

export function WorksProjectCards({ works, locale, viewLabel, categoryLabels }: WorksProjectCardsProps) {
  if (works.length === 0) {
    return <p className="py-16 text-center text-sm text-slate-500">—</p>;
  }

  return (
    <div className="works-project-grid">
      {works.map((work) => {
        const title = getLocalizedField(work, "title", locale);
        const summary = getLocalizedField(work, "summary", locale);
        const CategoryIcon = getWorkCategoryIcon(work.category);
        const gradient = WORK_CATEGORY_GRADIENTS[work.category] ?? WORK_CATEGORY_GRADIENTS.other;

        return (
          <Link key={work.id} href={`/works/${work.slug}`} className="works-project-card group" aria-label={`${title} — ${viewLabel}`}>
            <div className="works-project-visual" style={{ background: gradient }}>
              <span className="works-project-pill">
                <CategoryIcon className="h-3.5 w-3.5" aria-hidden />
                {categoryLabels[work.category] ?? work.category}
              </span>
              <span className="works-project-arrow">
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </span>
              <div className="works-project-art">
                {work.thumbnail ? (
                  <UploadImage
                    src={work.thumbnail}
                    alt=""
                    fill
                    className="object-contain object-center p-6 pb-14 transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <span className="works-project-glyph">
                    <CategoryIcon strokeWidth={1.2} aria-hidden />
                  </span>
                )}
              </div>
              <h3 className="works-project-title">{title}</h3>
            </div>
            <div className="works-project-body">
              <p>{summary}</p>
              {work.techStack.length > 0 ? (
                <div className="works-project-tags">
                  {work.techStack.slice(0, 4).map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
