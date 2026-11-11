import { NewsArticleContent } from "@/components/news/NewsArticleContent";
import { ChevronDown } from "lucide-react";

export function TeamIntroBlocks({ copy, pageLabel }: { copy: string[]; pageLabel: string }) {
  const items = copy.filter((text) => text.trim().length > 0);
  if (items.length === 0) return null;

  return (
    <section className="team-intro-section">
      <div className="team-page-inner">
        <div className="team-notebook-grid">
          {items.map((text, index) => (
            <details key={`${index}-${text.slice(0, 24)}`} className="team-notebook-page">
              <summary className="team-notebook-page-summary">
                <span>{`${pageLabel} ${String(index + 1).padStart(2, "0")}`}</span>
                <ChevronDown aria-hidden="true" className="team-notebook-page-chevron h-5 w-5" />
              </summary>
              <div className="team-notebook-page-body">
                <NewsArticleContent
                  content={text}
                  className="!mt-0 !text-base !leading-relaxed !text-slate-700 [&>p]:!mt-0 [&>p+p]:!mt-3 dark:!text-slate-300"
                />
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}