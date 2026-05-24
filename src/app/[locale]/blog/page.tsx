import Image from "next/image";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCachedBlogPosts } from "@/lib/cache/queries";
import { getLocalizedField } from "@/lib/i18n-content";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Locale } from "@/i18n/routing";

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const loc = locale as Locale;

  const posts = await getCachedBlogPosts(true);

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-50 to-white section-padding">
        <div className="container-narrow text-center">
          <h1 className="text-4xl font-bold text-slate-900">{t("title")}</h1>
          <p className="mt-4 text-lg text-slate-600">{t("subtitle")}</p>
        </div>
      </section>
      <section className="section-padding">
        <div className="container-narrow grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/${locale}/blog/${post.slug}`}>
              <Card className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                {post.thumbnail && (
                  <div className="relative aspect-video">
                    <Image src={post.thumbnail} alt={post.title} fill className="object-cover" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{getLocalizedField(post, "title", loc)}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {getLocalizedField(post, "summary", loc)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {post.publishedAt && (
                    <p className="text-xs text-slate-500">{format(post.publishedAt, "MMM d, yyyy")}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-primary-600">{t("read_more")} →</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        {posts.length === 0 && (
          <p className="text-center text-slate-500">No posts yet.</p>
        )}
      </section>
    </div>
  );
}
