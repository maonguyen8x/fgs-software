import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db";
import { getLocalizedField } from "@/lib/i18n-content";
import { format } from "date-fns";
import type { Locale } from "@/i18n/routing";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const loc = locale as Locale;

  const post = await prisma.blogPost.findFirst({
    where: { slug, status: "published" },
  });
  if (!post) notFound();

  return (
    <article>
      <section className="section-padding">
        <div className="container-narrow max-w-3xl">
          <Link href={`/${locale}/blog`} className="text-sm text-primary-600 hover:underline">
            ← {t("title")}
          </Link>
          <h1 className="mt-4 text-4xl font-bold">{getLocalizedField(post, "title", loc)}</h1>
          {post.publishedAt && (
            <p className="mt-2 text-slate-500">{format(post.publishedAt, "MMMM d, yyyy")}</p>
          )}
          {post.thumbnail && (
            <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl">
              <Image src={post.thumbnail} alt={post.title} fill className="object-cover" />
            </div>
          )}
          <div className="prose prose-slate mt-8 max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {getLocalizedField(post, "content", loc)}
            </ReactMarkdown>
          </div>
        </div>
      </section>
    </article>
  );
}
