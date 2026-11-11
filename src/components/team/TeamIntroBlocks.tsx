import { NewsArticleContent } from "@/components/news/NewsArticleContent";
import { Pencil } from "lucide-react";

export function TeamIntroBlocks({ copy, pageLabel }: { copy: string[]; pageLabel: string }) {
  const items = copy.filter((text) => text.trim().length > 0);
  if (items.length === 0) return null;

  return (
    <section className="team-intro-section">
      <div className="team-page-inner">
        <article className="team-notebook-page">
          <div className="team-notebook-bow" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <h2 className="team-notebook-title">{pageLabel}</h2>
          <div className="team-notebook-content">
            {items.map((text, index) => (
              <div key={`${index}-${text.slice(0, 24)}`} className="team-notebook-entry">
                <NewsArticleContent
                  content={text}
                  className="!mt-0 !text-base !leading-relaxed !text-slate-700 [&>p]:!mt-0 [&>p+p]:!mt-3 dark:!text-slate-300"
                />
              </div>
            ))}
          </div>
          <span className="team-notebook-pen" aria-hidden="true">
            <Pencil strokeWidth={1.6} />
          </span>
        </article>
      </div>
    </section>
  );
}