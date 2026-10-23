import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { AboutOfficeScene } from "@/components/about/AboutOfficeScene";
import { AboutIdentityOrbit } from "@/components/about/AboutIdentityOrbit";
import { AboutNotebookWorkflow } from "@/components/about/AboutNotebookWorkflow";
import { TimelineSection } from "@/components/about/TimelineSection";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { CoreValuesGrid } from "@/components/about/CoreValuesGrid";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { Link } from "@/i18n/navigation";
import { fetchAboutPageData } from "@/lib/cache/safe-about-data";
import { fetchPageBlockMap } from "@/lib/cache/safe-page-blocks";
import { getPageBlockBody, getPageBlockSubtitle, getPageBlockTitle } from "@/lib/page-content";
import { getSettingsMapSafe } from "@/lib/settings-safe";
import { getLocalizedField } from "@/lib/i18n-content";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const loc = locale as Locale;

  const [{ aboutSections, timeline, coreValues, whyItems }, blocks, settings] = await Promise.all([
    fetchAboutPageData(),
    fetchPageBlockMap("about"),
    getSettingsMapSafe(),
  ]);
  const localizeAboutSection = (section: "history" | "mission" | "vision") => {
    const content = aboutSections.find((item) => item.section === section);
    if (!content || (blocks.about_content_control && !blocks[section])) return undefined;
    const block = blocks[section];
    if (!block) return content;
    const title = getPageBlockTitle(blocks, section, loc, content.title ?? "");
    const body = getPageBlockBody(blocks, section, loc, getLocalizedField(content, "content", loc));
    return {
      ...content,
      title,
      titleJa: title,
      titleVi: title,
      content: body,
      contentJa: body,
      contentVi: body,
    };
  };
  const mission = localizeAboutSection("mission");
  const vision = localizeAboutSection("vision");
  const story = localizeAboutSection("history");
  const storyTitle = story ? getLocalizedField(story, "title", loc) : "";
  const storyContent = story ? getLocalizedField(story, "content", loc) : "";
  const managedWhyItems = Object.values(blocks)
    .filter((block) => block.key.startsWith("why_choose_"))
    .map((block) => {
      const title = getPageBlockTitle(blocks, block.key, loc, "");
      const description = getPageBlockBody(blocks, block.key, loc, "");
      const icon = getPageBlockSubtitle(blocks, block.key, loc, "Globe");
      return {
        id: block.id,
        icon,
        title,
        titleJa: title,
        titleVi: title,
        description,
        descriptionJa: description,
        descriptionVi: description,
      };
    })
    .filter((item) => item.title && item.description);
  const displayedWhyItems = blocks.why_choose_control ? managedWhyItems : whyItems;
  const contactEmail = settings.contact_email ?? settings.company_email;
  const headingParts = {
    prefix: getPageBlockTitle(blocks, "notebook_hero_prefix", loc, t("notebook.hero_prefix")),
    crossed: getPageBlockTitle(blocks, "notebook_hero_crossed", loc, t("notebook.hero_crossed")),
    highlight: getPageBlockTitle(blocks, "notebook_hero_highlight", loc, t("notebook.hero_highlight")),
    suffix: getPageBlockTitle(blocks, "notebook_hero_suffix", loc, t("notebook.hero_suffix")),
  };
  const heroDescription = getPageBlockSubtitle(
    blocks,
    "notebook_hero_section",
    loc,
    t("notebook.hero_description")
  );

  return (
    <main className="about-notebook-page">
      <section className="about-notebook-hero">
        <div className="about-notebook-paper-grid" aria-hidden />
        <span className="about-notebook-doodle about-notebook-doodle--gear" aria-hidden>⚙</span>
        <span className="about-notebook-doodle about-notebook-doodle--code" aria-hidden>{"{ }"}</span>
        <span className="about-notebook-doodle about-notebook-doodle--spark" aria-hidden>✳</span>
        <div className="container-narrow about-notebook-hero-inner">
          <div className="about-notebook-hero-copy">
            <p className="about-notebook-script">{t("notebook.eyebrow")}</p>
            <span className="about-notebook-page-title">{getPageBlockTitle(blocks, "page_header", loc, t("title"))}</span>
            <h1>
              {headingParts.prefix} <del>{headingParts.crossed}</del>{" "}
              <mark>{headingParts.highlight}</mark> {headingParts.suffix}
            </h1>
            <p className="about-notebook-hero-description">{heroDescription}</p>
            <span className="about-notebook-underline" aria-hidden />
          </div>

          <div className="about-notebook-polaroid-wrap">
            <div className="about-notebook-stamp" aria-label={`${t("notebook.since")} 20XX`}>
              <span>{t("notebook.since")}</span>
              <strong>20XX</strong>
            </div>
            <figure className="about-notebook-polaroid">
              <span className="about-notebook-tape" aria-hidden />
              <AboutOfficeScene idPrefix="about-hero-office" />
              <figcaption>{t("notebook.art_label")}</figcaption>
            </figure>
            <p className="about-notebook-margin-note">{t("notebook.scroll_note")}</p>
          </div>
        </div>
      </section>

      <AboutIdentityOrbit
        title={t("identity_title")}
        subtitle={t("identity_subtitle")}
      />

      <section className="about-notebook-story">
        <div className="container-narrow">
          <div className="about-notebook-section-head">
            <p className="about-notebook-chapter">{t("notebook.story_chapter")}</p>
            <h2>{storyTitle || t("notebook.story_title")}</h2>
            <p>{t("notebook.story_note")}</p>
          </div>
          <div className="about-notebook-story-grid">
            <figure className="about-notebook-team-polaroid">
              <span className="about-notebook-tape about-notebook-tape--left" aria-hidden />
              <span className="about-notebook-tape about-notebook-tape--right" aria-hidden />
              <AboutOfficeScene idPrefix="about-story-office" />
              <figcaption>{t("notebook.story_caption")}</figcaption>
            </figure>
            <div className="about-notebook-story-copy">
              {storyContent ? <p>{storyContent}</p> : null}
              {(mission || vision) ? (
                <div className="about-notebook-mission-grid">
                  {[mission, vision].map((item) => item ? (
                    <article key={item.id} className="about-notebook-mission-card">
                      <span>{item.section === "mission" ? t("mission") : t("vision")}</span>
                      {getLocalizedField(item, "title", loc) ? <h3>{getLocalizedField(item, "title", loc)}</h3> : null}
                      <p>{getLocalizedField(item, "content", loc)}</p>
                    </article>
                  ) : null)}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="about-notebook-timeline">
        <TimelineSection
          title={getPageBlockTitle(blocks, "timeline_section", loc, t("timeline_title"))}
          items={timeline}
          locale={loc}
        />
      </div>

      <section className="about-notebook-values-and-why">
        <div className="container-narrow">
          <p className="about-notebook-chapter">{t("notebook.values_chapter")}</p>
          <p className="about-notebook-dark-note">{t("notebook.values_note")}</p>
          <div className="about-notebook-values-grid">
            <CoreValuesGrid
              title={getPageBlockTitle(blocks, "values_section", loc, t("values_title"))}
              items={coreValues}
              locale={loc}
              variant="notebook"
            />
            <div className="about-notebook-why">
              <h2 className="about-notebook-ring-heading">
                {getPageBlockTitle(blocks, "why_section", loc, t("why_japan_title"))}
              </h2>
              <WhyChooseUs items={displayedWhyItems} locale={loc} variant="notebook" />
            </div>
          </div>
        </div>
      </section>

      <AboutNotebookWorkflow />

      <section className="about-notebook-join">
        <div className="container-narrow about-notebook-join-panel">
          <div>
            <p className="about-notebook-chapter">{t("notebook.why_chapter")}</p>
            <h2>{t("notebook.why_title")}</h2>
            <p>{t("notebook.why_copy")}</p>
            <Link href="/about-us" className="about-notebook-dark-button">{t("notebook.join_cta")}</Link>
          </div>
          <div className="about-notebook-join-art" aria-hidden>
            <span className="about-notebook-join-sun" />
            <span className="about-notebook-join-window" />
            <span className="about-notebook-join-plant">✿</span>
            <span className="about-notebook-join-mark">{t("identity_title")}</span>
          </div>
        </div>
      </section>

      <section className="about-notebook-closing">
        <div className="container-narrow">
          <p className="about-notebook-last-page">{t("notebook.last_page")}</p>
          <span className="about-notebook-heart-divider" aria-hidden>♡</span>
          <h2>{t("notebook.closing_title")}</h2>
          <p>{t("notebook.closing_copy")}</p>
          <div className="about-notebook-closing-actions">
            <Link href="/contact" className="about-notebook-dark-button">{t("notebook.start_conversation")}</Link>
            {contactEmail ? <a href={`mailto:${contactEmail}`}>{contactEmail}</a> : null}
          </div>
        </div>
      </section>
      <ScrollToTopButton />
    </main>
  );
}
