import { notFound } from "next/navigation";
import { UploadImage } from "@/components/ui/UploadImage";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCachedFounders } from "@/lib/cache/queries";
import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import { ArrowLeft, User } from "lucide-react";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import {
  TEAM_PORTRAIT_DETAIL_FRAME_CLASS,
  TEAM_PORTRAIT_DETAIL_IMAGE_CLASS,
} from "@/lib/portrait-image";

export default async function LeaderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations("team.leadership");

  const founders = await getCachedFounders();
  const member = founders.find((f) => f.id === id && f.isVisible);
  if (!member) notFound();

  const role = getLocalizedField(member, "role", loc);
  const slogan = getLocalizedField(member, "slogan", loc);
  const bio = getLocalizedField(member, "bio", loc);
  const avatarSrc = member.avatar?.split("?")[0];

  return (
    <div className="bg-linear-to-b from-sky-50/40 via-white to-white dark:from-slate-950 dark:to-slate-900">
      <section className="team-flow-section">
        <div className="team-page-inner">
          <Link
            href="/team"
            className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-primary-600 transition-colors hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back_to_team")}
          </Link>

          <article className="team-page-panel px-6 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
              <div className={`${TEAM_PORTRAIT_DETAIL_FRAME_CLASS} mx-auto shrink-0 ring-2 ring-primary-100 md:mx-0`}>
                {avatarSrc ? (
                  <UploadImage
                    src={avatarSrc}
                    alt={member.name}
                    fill
                    className={TEAM_PORTRAIT_DETAIL_IMAGE_CLASS}
                    sizes="(max-width: 768px) 280px, 300px"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-primary-300">
                    <User className="h-16 w-16" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl dark:text-white">
                  {member.name}
                </h1>
                <p className="mt-2 text-lg font-semibold text-primary-600 md:text-xl dark:text-primary-400">
                  {role}
                </p>
                {slogan && (
                  <p className="mt-4 text-base italic leading-relaxed text-slate-500 md:text-lg dark:text-slate-400">
                    &ldquo;{slogan}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {bio && (
              <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-5 md:p-6 dark:border-slate-600/80 dark:bg-white">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  {t("bio_heading")}
                </h2>
                <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-slate-700 md:text-lg dark:text-slate-700">
                  {bio}
                </p>
              </div>
            )}

            {member.skills.length > 0 && (
              <div className="mt-8 text-left">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  {t("skills_heading")}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-800 dark:bg-primary-100 dark:text-primary-900"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </section>
      <ScrollToTopButton />
    </div>
  );
}
