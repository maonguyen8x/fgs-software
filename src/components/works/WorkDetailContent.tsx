"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import type { Work } from "@prisma/client";
import { WorkDetailGallery } from "@/components/works/WorkDetailGallery";
import { WorkVideoPlayer } from "@/components/works/WorkVideoPlayer";
import { usePublicPath } from "@/components/providers/PublicPathsProvider";

const CATEGORY_LABELS: Record<string, string> = {
  web: "Web",
  mobile: "Mobile",
  api: "API",
  other: "Other",
};

function SectionDivider() {
  return <hr className="my-7 border-0 border-t border-slate-200/90 md:my-8 dark:border-slate-200/20" />;
}

interface WorkDetailContentProps {
  work: Work;
  locale: Locale;
  images: string[];
  labels: {
    back: string;
    duration: string;
    demo: string;
    github: string;
    gallery: string;
    video: string;
  };
}

export function WorkDetailContent({ work, locale, images, labels }: WorkDetailContentProps) {
  const worksListHref = usePublicPath("/works");
  const title = getLocalizedField(work, "title", locale);
  const summary = getLocalizedField(work, "summary", locale);
  const description = getLocalizedField(work, "description", locale);
  const categoryLabel = CATEGORY_LABELS[work.category] ?? work.category;
  const hasDescription = Boolean(description.trim());
  const hasLinks = Boolean(work.demoUrl || work.githubUrl);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={worksListHref}
        className="mb-5 inline-flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-primary-600 transition-colors hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
      >
        <ArrowLeft className="h-4 w-4" />
        {labels.back}
      </Link>

      <article className="work-detail-panel rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_4px_28px_-8px_rgba(15,23,42,0.1)] ring-1 ring-slate-100/90 md:rounded-3xl md:p-8 lg:p-10 dark:border-slate-700/90 dark:bg-white dark:ring-slate-200/10">
        <span className="inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:bg-primary-950 dark:text-primary-300">
          {categoryLabel}
        </span>
        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-4xl lg:text-[2.5rem] lg:leading-tight">
          {title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600 md:text-xl md:leading-relaxed">
          {summary}
        </p>

        {work.techStack.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {work.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {work.duration && (
          <p className="mt-5 text-base text-slate-500">
            <span className="font-semibold text-slate-700">{labels.duration}:</span> {work.duration}
          </p>
        )}

        {work.videoUrl && (
          <>
            <SectionDivider />
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-600">
              {labels.video}
            </h2>
            <WorkVideoPlayer work={work} title={title} />
          </>
        )}

        {images.length > 0 && (
          <>
            <SectionDivider />
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-600">
              {labels.gallery}
            </h2>
            <WorkDetailGallery images={images} title={title} />
          </>
        )}

        {hasDescription && (
          <>
            <SectionDivider />
            <div className="work-detail-prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
            </div>
          </>
        )}

        {hasLinks && (
          <>
            <SectionDivider />
            <div className="flex flex-wrap gap-3">
              {work.demoUrl && (
                <a
                  href={work.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-600/25 transition-all hover:bg-primary-700 hover:shadow-lg"
                >
                  <ExternalLink className="h-4 w-4" />
                  {labels.demo}
                </a>
              )}
              {work.githubUrl && (
                <a
                  href={work.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800"
                >
                  {labels.github}
                </a>
              )}
            </div>
          </>
        )}
      </article>
    </div>
  );
}
