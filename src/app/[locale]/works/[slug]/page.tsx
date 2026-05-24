import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db";
import { getLocalizedField } from "@/lib/i18n-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";
import { ExternalLink } from "lucide-react";

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("works");
  const loc = locale as Locale;

  const work = await prisma.work.findFirst({
    where: { slug, isVisible: true },
  });
  if (!work) notFound();

  const description = getLocalizedField(work, "description", loc);

  return (
    <article>
      <section className="bg-gradient-to-br from-primary-50 to-white section-padding">
        <div className="container-narrow">
          <Button asChild variant="ghost" className="mb-4">
            <Link href={`/${locale}/works`}>← {t("filter_all")}</Link>
          </Button>
          <Badge className="mb-4">{work.category}</Badge>
          <h1 className="text-4xl font-bold">{getLocalizedField(work, "title", loc)}</h1>
          <p className="mt-4 text-lg text-slate-600">{getLocalizedField(work, "summary", loc)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {work.techStack.map((tech) => (
              <Badge key={tech} variant="secondary">{tech}</Badge>
            ))}
          </div>
          {work.duration && (
            <p className="mt-4 text-sm text-slate-500">{t("duration")}: {work.duration}</p>
          )}
        </div>
      </section>

      {work.thumbnail && (
        <div className="container-narrow relative mb-8 aspect-video overflow-hidden rounded-2xl">
          <Image src={work.thumbnail} alt={work.title} fill className="object-cover" />
        </div>
      )}

      <section className="section-padding">
        <div className="container-narrow prose prose-slate max-w-3xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
        </div>
        {(work.demoUrl || work.githubUrl) && (
          <div className="container-narrow mt-8 flex gap-4">
            {work.demoUrl && (
              <Button asChild>
                <a href={work.demoUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t("demo")}
                </a>
              </Button>
            )}
            {work.githubUrl && (
              <Button asChild variant="outline">
                <a href={work.githubUrl} target="_blank" rel="noopener noreferrer">
                  {t("github")}
                </a>
              </Button>
            )}
          </div>
        )}
      </section>
    </article>
  );
}
