import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCachedFounders } from "@/lib/cache/queries";
import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import { PageSection } from "@/components/layout/PageSection";
import { ArrowLeft, User } from "lucide-react";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";

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
      <PageSection className="!py-6">
        <Link
          href="/team"
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back_to_team")}
        </Link>
      </PageSection>

      <PageSection>
        <article className="mx-auto max-w-3xl text-left">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="relative mx-0 h-36 w-36 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-2 ring-primary-100 dark:bg-slate-800">
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={member.name}
                  fill
                  className="object-cover"
                  sizes="144px"
                  unoptimized={avatarSrc.startsWith("/uploads/")}
                />
              ) : (
                <span className="flex h-full items-center justify-center text-primary-300">
                  <User className="h-16 w-16" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{member.name}</h1>
              <p className="mt-2 text-lg font-medium text-primary-600">{role}</p>
              {slogan && (
                <p className="mt-4 text-base italic text-slate-500 dark:text-slate-400">&ldquo;{slogan}&rdquo;</p>
              )}
            </div>
          </div>

          {bio && (
            <div className="mt-8 rounded-2xl border border-slate-200/90 bg-white p-6 text-left shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">{t("bio_heading")}</h2>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-slate-700 dark:text-slate-300">
                {bio}
              </p>
            </div>
          )}

          {member.skills.length > 0 && (
            <div className="mt-6 text-left">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">{t("skills_heading")}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {member.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-800 dark:bg-primary-950 dark:text-primary-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>
      </PageSection>
      <ScrollToTopButton />
    </div>
  );
}
