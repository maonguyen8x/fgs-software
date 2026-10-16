import { BrainCircuit, BriefcaseBusiness, CalendarDays, Sparkles } from "lucide-react";
import type { Work } from "@prisma/client";
import type { Locale } from "@/i18n/routing";
import { getLocalizedField } from "@/lib/i18n-content";

interface AIPortfolioShowcaseProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  products: Work[];
  locale: Locale;
  productLabel: string;
}

const PRODUCT_VISUALS = [
  {
    icon: CalendarDays,
    accent: "violet",
  },
  {
    icon: BriefcaseBusiness,
    accent: "cyan",
  },
  {
    icon: BrainCircuit,
    accent: "rose",
  },
] as const;

export function AIPortfolioShowcase({
  eyebrow,
  title,
  subtitle,
  products,
  locale,
  productLabel,
}: AIPortfolioShowcaseProps) {
  return (
    <section className="ai-portfolio-showcase relative overflow-hidden px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="container-narrow relative">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
            {eyebrow}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl dark:text-white">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base dark:text-slate-300">
            {subtitle}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {products.map((product, index) => {
            const visual = PRODUCT_VISUALS[index % PRODUCT_VISUALS.length];
            const Icon = visual.icon;
            const productTitle = getLocalizedField(product, "title", locale);
            const productSummary = getLocalizedField(product, "summary", locale);
            return (
              <article
                key={product.id}
                className={`ai-portfolio-card ai-portfolio-card--${visual.accent} group`}
              >
                <div className="ai-portfolio-card-visual">
                  <div className="ai-portfolio-card-orbit ai-portfolio-card-orbit--one" aria-hidden />
                  <div className="ai-portfolio-card-orbit ai-portfolio-card-orbit--two" aria-hidden />
                  <div className="ai-portfolio-card-interface" aria-hidden>
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                      <span className="flex items-center gap-2 text-[9px] font-semibold tracking-[0.16em] text-slate-300">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden />
                        {productLabel}
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]" />
                    </div>
                    <div className="flex h-[168px] items-center justify-center">
                      <span className="ai-portfolio-card-icon">
                        <Icon className="h-10 w-10" strokeWidth={1.35} aria-hidden />
                      </span>
                    </div>
                    <div className="mx-4 mb-4 h-1 rounded-full bg-white/10">
                      <span className="block h-full w-2/3 rounded-full bg-white/50" />
                    </div>
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {String(index + 1).padStart(2, "0")} / {productLabel}
                  </span>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    {productTitle}
                  </h3>
                  <p className="mt-2 min-h-[4.5rem] text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {productSummary}
                  </p>
                  <ul className="mt-5 space-y-2 border-t border-slate-200 pt-4 dark:border-slate-700">
                    {product.techStack.slice(0, 4).map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-500" aria-hidden />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
