import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarDays, Calculator, Mail } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactLocations } from "@/components/contact/ContactLocations";
import { Link } from "@/i18n/navigation";
import { DEFAULT_CONTACT_INBOX } from "@/lib/email";
import { getCachedBranches } from "@/lib/cache/queries";
import { logger } from "@/lib/logger";
import type { Locale } from "@/i18n/routing";

export const revalidate = 300;
const BRANCH_FETCH_TIMEOUT_MS = 3000;

async function fetchContactBranches() {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      getCachedBranches(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error(`Contact location fetch timed out after ${BRANCH_FETCH_TIMEOUT_MS}ms`)),
          BRANCH_FETCH_TIMEOUT_MS
        );
      }),
    ]);
  } catch (error) {
    logger.error("Contact locations fetch failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const branches = await fetchContactBranches();

  const contactLinks = [
    {
      icon: CalendarDays,
      title: t("book_session_title"),
      description: t("book_session_description"),
      href: "#contact-form",
    },
    {
      icon: Calculator,
      title: t("project_estimator_title"),
      description: t("project_estimator_description"),
      href: "/services",
    },
    {
      icon: Mail,
      title: t("direct_line_title"),
      description: DEFAULT_CONTACT_INBOX,
      href: `mailto:${DEFAULT_CONTACT_INBOX}`,
    },
  ];

  return (
    <div className="contact-experience relative isolate overflow-hidden bg-[#faf9ff] text-slate-950">
      <div className="contact-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      <div className="contact-glow contact-glow--left pointer-events-none absolute inset-0" aria-hidden />
      <div className="contact-glow contact-glow--right pointer-events-none absolute inset-0" aria-hidden />

      <section className="container-narrow relative grid gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12 lg:px-8 lg:py-16">
        <div className="flex flex-col justify-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
            {t("eyebrow")}
          </p>
          <h1 className="max-w-[12ch] text-5xl font-semibold leading-[0.99] tracking-[-0.055em] sm:text-6xl lg:text-[clamp(3.5rem,5.3vw,5.5rem)]">
            {t("headline_start")}{" "}
            <span className="contact-headline-accent">{t("headline_accent")}</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {t("intro")}
          </p>

          <div className="mt-9 flex flex-col gap-3">
            {contactLinks.map(({ icon: Icon, title, description, href }) => (
              <Link
                key={title}
                href={href}
                className="group flex items-center gap-4 rounded-[1.6rem] border border-white/90 bg-white/75 p-4 shadow-[0_12px_40px_-30px_rgba(40,27,83,0.3)] backdrop-blur transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-white sm:p-5"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#111116] text-white transition group-hover:bg-violet-700">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-900">{title}</span>
                  <span className="mt-0.5 block text-sm text-slate-500">{description}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/90 bg-white/80 p-5 shadow-[0_28px_90px_-48px_rgba(36,26,68,0.35)] backdrop-blur-xl sm:p-8 lg:p-10">
          <h2 className="sr-only">{t("form_title")}</h2>
          <ContactForm />
        </div>
      </section>
      <ContactLocations
        title={t("locations_title")}
        subtitle={t("locations_subtitle")}
        branches={branches}
        locale={locale as Locale}
      />
    </div>
  );
}
