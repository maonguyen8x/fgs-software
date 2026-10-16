"use client";

import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import type { TechStack } from "@prisma/client";
import { HOME_CHAPTER_IDS, type HomeChapterId } from "@/lib/home-chapters";
import { cn } from "@/lib/utils";

export interface HomeServiceItem {
  id: string;
  icon: string;
  title: string;
  titleJa?: string | null;
  titleVi?: string | null;
  description: string;
  descriptionJa?: string | null;
  descriptionVi?: string | null;
}

function getIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  return icons[name] ?? LucideIcons.Code2;
}

function ChapterSection({
  id,
  children,
  className,
}: {
  id: HomeChapterId;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      data-home-chapter={id}
      className={cn(
        "home-chapter-section scroll-mt-24 border-b border-slate-200/80 py-3 dark:border-slate-800",
        className
      )}
    >
      {children}
    </section>
  );
}

function SectionHead({
  badge,
  title,
  titleAccent,
  actionHref,
  actionLabel,
  subtitle,
}: {
  badge: string;
  title: string;
  titleAccent?: string;
  actionHref?: string;
  actionLabel?: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          {badge}
        </p>
        <h3 className="max-w-2xl text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white">
          {title}{" "}
          {titleAccent ? (
            <span className="font-serif italic text-violet-600 dark:text-violet-400">{titleAccent}</span>
          ) : null}
        </h3>
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
        >
          {actionLabel}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

function Chapter01Services({
  services,
  locale,
  copy,
}: {
  services: HomeServiceItem[];
  locale: Locale;
  copy?: HomeChapterCopy;
}) {
  const t = useTranslations("home.chapters");

  return (
    <ChapterSection id="chapter-01">
      <SectionHead
        badge={t("chapter-01_badge")}
        title={copy?.title || t("chapter-01_headline")}
        titleAccent={copy?.title ? undefined : t("chapter-01_headline_accent")}
        subtitle={copy?.subtitle}
        actionHref="/products"
        actionLabel={t("explore_all")}
      />
      <div className="mx-auto grid w-full max-w-[1120px] grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5 xl:gap-4">
        {services.slice(0, 10).map((service, index) => {
          const Icon = getIcon(service.icon);
          const title = getLocalizedField(service, "title", locale);
          return (
            <motion.article
              key={service.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.04, duration: 0.45 }}
              className="home-service-card group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0c0f14] p-4 text-white shadow-lg sm:p-5"
            >
              <span className="home-service-card-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="home-service-card-glow pointer-events-none absolute inset-0 opacity-60" aria-hidden />
              <div className="relative mt-3 flex h-24 items-center justify-center">
                <Icon className="h-14 w-14 text-violet-400/90 drop-shadow-[0_0_18px_rgba(167,139,250,0.55)]" strokeWidth={1.1} />
              </div>
              <h4 className="relative mt-2 text-center text-sm font-semibold leading-snug">{title}</h4>
              <span className="home-service-card-accent" aria-hidden />
            </motion.article>
          );
        })}
      </div>
    </ChapterSection>
  );
}

const OUTER_ORBIT_TECH = [
  ["Next.js", "PanelsTopLeft"],
  ["Postgres", "Database"],
  ["Flutter", "Smartphone"],
  ["Docker", "Box"],
  ["LangChain", "Workflow"],
  ["Python", "Code2"],
] as const;

const INNER_ORBIT_TECH = [
  ["Node.js", "Server"],
  ["ReactJS", "Atom"],
  ["AWS", "Cloud"],
  ["AI/ML", "BrainCircuit"],
] as const;

export interface HomeOrbitTechnology {
  name: string;
  icon: string;
}

const TECH_CATEGORY_KEYS = [
  ["web", "frontend"],
  ["backend", "backend"],
  ["ai", "tools"],
  ["cloud", "devops"],
  ["mobile", "mobile"],
  ["data", "database"],
] as const;

function techNames(items: TechStack[], category: string): string[] {
  if (category === "tools") {
    return items
      .filter((item) => item.category === category && /ai|llm|langchain|openai|pytorch|tensorflow/i.test(item.name))
      .map((item) => item.name);
  }
  return items.filter((item) => item.category === category).map((item) => item.name);
}

function Chapter02Technologies({
  techStack,
  companyName,
  copy,
  outerOrbitTech,
  innerOrbitTech,
}: {
  techStack: TechStack[];
  companyName: string;
  copy?: HomeChapterCopy;
  outerOrbitTech?: HomeOrbitTechnology[];
  innerOrbitTech?: HomeOrbitTechnology[];
}) {
  const t = useTranslations("home.chapters");
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-80px" });

  const [brandMark = "FGS", ...brandNameParts] = companyName.trim().split(/\s+/);
  const outerTech = outerOrbitTech ?? OUTER_ORBIT_TECH.map(([name, icon]) => ({ name, icon }));
  const innerTech = innerOrbitTech ?? INNER_ORBIT_TECH.map(([name, icon]) => ({ name, icon }));
  return (
    <ChapterSection id="chapter-02">
      <SectionHead 
      badge={t("chapter-02_badge")} 
      title={copy?.title || t("chapter-02_headline")}
      titleAccent={copy?.title ? undefined : t("chapter-02_headline_accent")}
      subtitle={copy?.subtitle} />
      <div className="grid gap-3 lg:grid-cols-[minmax(300px,0.88fr)_minmax(0,1.12fr)] lg:items-center">
        <div
          ref={ref}
          className="home-tech-orbit-stage group relative mx-auto aspect-square w-full max-w-[430px]"
          aria-label={t("tech_orbit_aria")}
          role="group"
          tabIndex={0}
        >
          <motion.div
            className="absolute inset-[18%] rounded-full bg-linear-to-br from-violet-500/30 to-cyan-400/20 blur-2xl"
            animate={inView ? { scale: [1, 1.06, 1], opacity: [0.5, 0.75, 0.5] } : undefined}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="home-tech-orbit-ring home-tech-orbit-ring--outer absolute inset-[5%] rounded-full border border-slate-300/60 dark:border-slate-600/50" />
          <div className="home-tech-orbit-ring home-tech-orbit-ring--inner absolute inset-[24%] rounded-full border border-violet-400/45" />
          <div className="home-tech-orbit-track home-tech-orbit-track--outer absolute inset-[5%]">
            {outerTech.map(({ name, icon }, index) => {
              const Icon = getIcon(icon);
              const angle = (index / outerTech.length) * Math.PI * 2 - Math.PI / 2;
              return (
                <span
                  key={name}
                  className="home-tech-orbit-item"
                  style={{
                    left: `${50 + Math.cos(angle) * 42}%`,
                    top: `${50 + Math.sin(angle) * 42}%`,
                  }}
                >
                  <span className="home-tech-orbit-counter">
                    <Icon className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300" aria-hidden />
                    {name}
                  </span>
                </span>
              );
            })}
          </div>

          <div className="home-tech-orbit-track home-tech-orbit-track--inner absolute inset-[12%]">
            {innerTech.map(({ name, icon }, index) => {
              const Icon = getIcon(icon);
              const angle = (index / innerTech.length) * Math.PI * 2 - Math.PI / 2;
              return (
                <span
                  key={name}
                  className="home-tech-orbit-item"
                  style={{
                    left: `${50 + Math.cos(angle) * 36}%`,
                    top: `${50 + Math.sin(angle) * 36}%`,
                  }}
                >
                  <span className="home-tech-orbit-counter">
                    <Icon className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300" aria-hidden />
                    {name}
                  </span>
                </span>
              );
            })}
          </div>

          <div className="home-tech-wordmark absolute left-1/2 top-1/2 z-10 flex h-[30%] w-[30%] items-center justify-center rounded-full bg-violet-800 px-2 text-center text-white shadow-[0_0_48px_rgba(124,58,237,0.5)]">
            <span className="sr-only">{companyName}</span>
            <span aria-hidden className="home-tech-wordmark-lockup">
              <LucideIcons.BrainCircuit className="home-tech-wordmark-symbol" strokeWidth={1.5} />
              <span className="home-tech-wordmark-letters">
                {Array.from(brandMark).map((letter, index) => (
                  <span key={`${letter}-${index}`} style={{ animationDelay: `${index * 0.5}s` }}>
                    {letter}
                  </span>
                ))}
              </span>
              <span className="home-tech-wordmark-subtitle">
                {brandNameParts.join(" ") || t("tech_orbit_software")}
              </span>
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {TECH_CATEGORY_KEYS.map(([key, category]) => {
            const databaseTags = techNames(techStack, category);
            const tags = databaseTags.length > 0 ? databaseTags : t(`tech_${key}_tags`).split(",");
            const CategoryIcon = getIcon(
              {
                web: "Code2",
                backend: "Server",
                ai: "Brain",
                cloud: "Cloud",
                mobile: "Smartphone",
                data: "Database",
              }[key]
            );
            return (
              <div
                key={key}
                className="rounded-2xl border border-slate-200/90 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/60"
              >
                <p className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <CategoryIcon className="h-4 w-4 text-violet-600" aria-hidden />
                  {t(`tech_${key}_title`)}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ChapterSection>
  );
}

function StepPipeline({
  chapterId,
  stepKeys,
  variant,
  copy,
}: {
  chapterId: "chapter-03" | "chapter-04";
  stepKeys: readonly string[];
  variant: "pipeline" | "nda";
  copy?: HomeChapterCopy;
}) {
  const t = useTranslations("home.chapters");
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-60px" });
  const shouldReduceMotion = useReducedMotion();

  return (
    <ChapterSection id={chapterId}>
      <SectionHead
        badge={t(`${chapterId}_badge`)}
        title={copy?.title || t(`${chapterId}_headline`)}
        titleAccent={copy?.title ? undefined : t(`${chapterId}_headline_accent`)}
        subtitle={copy?.subtitle}
      />
      <div ref={ref} className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/50">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {t(`${chapterId}_pipeline_label`)}
          </p>
          <div className="home-pipeline-steps relative mt-6 flex flex-col gap-4 md:flex-row md:items-stretch md:justify-between">
            {variant === "pipeline" && inView && !shouldReduceMotion ? (
              <motion.span
                className="home-pipeline-progress-dot"
                aria-hidden
                initial={{ left: "17%" }}
                animate={{ left: "83%" }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
              />
            ) : null}
            {stepKeys.map((key, index) => {
              const Icon = getIcon(t(`${chapterId}_step_${key}_icon`));
              const active = inView;
              return (
                <motion.div
                  key={key}
                  className="relative flex flex-1 flex-col items-center text-center"
                  initial={{ opacity: 0.4, y: 8 }}
                  animate={inView ? { opacity: 1, y: 0 } : undefined}
                  transition={{ delay: index * 0.12, duration: 0.4 }}
                >
                  {index < stepKeys.length - 1 ? (
                    <motion.span
                      className="absolute left-[calc(50%+28px)] top-6 hidden h-0.5 w-[calc(100%-56px)] bg-linear-to-r from-violet-500 to-violet-300 md:block"
                      initial={{ scaleX: 0 }}
                      animate={inView ? { scaleX: 1 } : undefined}
                      transition={{ delay: 0.2 + index * 0.15, duration: 0.5 }}
                      style={{ transformOrigin: "left center" }}
                    />
                  ) : null}
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900",
                      active
                        ? "border-violet-500 text-violet-600 shadow-[0_0_24px_rgba(124,58,237,0.25)]"
                        : "border-slate-200 text-slate-400 dark:border-slate-600"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mt-2 text-lg font-bold text-violet-600">{t(`${chapterId}_step_${key}_metric`)}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {t(`${chapterId}_step_${key}_label`)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {(variant === "pipeline"
            ? (["velocity", "nps"] as const)
            : (["secure", "trust"] as const)
          ).map((card) => (
            <div
              key={card}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/50"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {t(`${chapterId}_card_${card}_title`)}
              </p>
              <p className="mt-2 text-3xl font-bold text-violet-600">{t(`${chapterId}_card_${card}_value`)}</p>
              <p className="mt-1 text-xs text-slate-500">{t(`${chapterId}_card_${card}_caption`)}</p>
            </div>
          ))}
        </div>
      </div>
    </ChapterSection>
  );
}

function Chapter05Connect({ copy }: { copy?: HomeChapterCopy }) {
  const t = useTranslations("home.chapters");
  const steps = ["explore", "connect", "collaborate"] as const;
  const shouldReduceMotion = useReducedMotion();
  const processPoints = [
    [44, 180],
    [112, 112],
    [180, 76],
    [250, 105],
    [318, 164],
    [386, 228],
    [456, 180],
  ] as const;
  const processLabels = [
    { key: "you", x: 44, y: 208 },
    { key: "analysis", x: 112, y: 88 },
    { key: "design", x: 180, y: 52 },
    { key: "coding", x: 250, y: 80 },
    { key: "testing", x: 318, y: 192 },
    { key: "delivery", x: 386, y: 256 },
    { key: "output", x: 456, y: 208 },
  ] as const;

  return (
    <ChapterSection id="chapter-05" className="border-b-0">
      <SectionHead
        badge={t("chapter-05_badge")}
        title={copy?.title || t("chapter-05_headline")}
        titleAccent={copy?.title ? undefined : t("chapter-05_headline_accent")}
        subtitle={copy?.subtitle}
        actionHref="/contact"
        actionLabel={t("chapter-05_cta")}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="flex flex-col gap-3">
          {steps.map((step, index) => {
            const Icon = getIcon(t(`chapter-05_step_${step}_icon`));
            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/50"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <p className="text-xs font-bold text-violet-600">
                    {String(index + 1).padStart(2, "0")} {t(`chapter-05_step_${step}_title`)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {t(`chapter-05_step_${step}_desc`)}
                  </p>
                </span>
              </motion.div>
            );
          })}
        </div>
        <div className="home-connect-graph relative min-h-[340px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white dark:border-slate-700 dark:bg-slate-900/40">
          <svg
            viewBox="0 0 500 360"
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label={t("chapter-05_graph_aria")}
          >
            {processPoints.map(([x, y], index, nodes) => (
              <g key={index}>
                {index < nodes.length - 1 ? (
                  <motion.line
                    key={`process-edge-${index}`}
                    x1={x}
                    y1={y}
                    x2={nodes[index + 1][0]}
                    y2={nodes[index + 1][1]}
                    className="home-connect-edge"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.85, delay: index * 0.08 }}
                  />
                ) : null}
                <motion.circle
                  cx={x}
                  cy={y}
                  r={index === 0 || index === nodes.length - 1 ? 7 : 5}
                  className={index === 0 || index === nodes.length - 1 ? "home-connect-node home-connect-node--accent" : "home-connect-node"}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + index * 0.08 }}
                />
              </g>
            ))}
            <motion.circle
              r="4"
              className="home-connect-signal"
              initial={{ cx: processPoints[0][0], cy: processPoints[0][1] }}
              animate={
                shouldReduceMotion
                  ? { cx: processPoints[0][0], cy: processPoints[0][1] }
                  : {
                      cx: processPoints.map(([x]) => x),
                      cy: processPoints.map(([, y]) => y),
                    }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 8, repeat: Infinity, repeatDelay: 0.8, ease: "linear" }
              }
            />
            {processLabels.map(({ key, x, y }) => (
              <text key={key} x={x} y={y} className="home-connect-label">
                {t(`chapter-05_graph_${key}`)}
              </text>
            ))}
          </svg>
        </div>
      </div>
    </ChapterSection>
  );
}

export interface HomeChapterCopy {
  title?: string;
  subtitle?: string;
}

interface HomeChapterPanelsProps {
  services: HomeServiceItem[];
  techStack: TechStack[];
  companyName: string;
  locale: Locale;
  chapterCopy?: Partial<Record<HomeChapterId, HomeChapterCopy>>;
  outerOrbitTech?: HomeOrbitTechnology[];
  innerOrbitTech?: HomeOrbitTechnology[];
}

export function HomeChapterPanels({
  services,
  techStack,
  companyName,
  locale,
  chapterCopy,
  outerOrbitTech,
  innerOrbitTech,
}: HomeChapterPanelsProps) {
  return (
    <>
      <Chapter01Services services={services} locale={locale} copy={chapterCopy?.["chapter-01"]} />
      <Chapter02Technologies
        techStack={techStack}
        companyName={companyName}
        copy={chapterCopy?.["chapter-02"]}
        outerOrbitTech={outerOrbitTech}
        innerOrbitTech={innerOrbitTech}
      />
      <StepPipeline
        chapterId="chapter-03"
        stepKeys={["ideate", "design", "build", "ship", "scale"]}
        variant="pipeline"
        copy={chapterCopy?.["chapter-03"]}
      />
      <StepPipeline
        chapterId="chapter-04"
        stepKeys={["discover", "nda", "exchange", "deliver"]}
        variant="nda"
        copy={chapterCopy?.["chapter-04"]}
      />
      <Chapter05Connect copy={chapterCopy?.["chapter-05"]} />
    </>
  );
}

export { HOME_CHAPTER_IDS };
