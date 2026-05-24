import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { locales } from "@/i18n/routing";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const staticPages = ["", "/about", "/services", "/team", "/works", "/blog", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const works = await prisma.work.findMany({ where: { isVisible: true }, select: { slug: true } });
  const posts = await prisma.blogPost.findMany({
    where: { status: "published" },
    select: { slug: true },
  });

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}${page}`])
          ),
        },
      });
    }
    for (const work of works) {
      entries.push({ url: `${baseUrl}/${locale}/works/${work.slug}`, lastModified: new Date() });
    }
    for (const post of posts) {
      entries.push({ url: `${baseUrl}/${locale}/blog/${post.slug}`, lastModified: new Date() });
    }
  }

  return entries;
}
