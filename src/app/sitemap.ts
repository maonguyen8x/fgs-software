import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { locales } from "@/i18n/routing";
import { getSettingsMapSafe } from "@/lib/settings-safe";
import {
  NAV_ID_INTERNAL_ROUTES,
  parsePublicPathMapsFromSettings,
  resolveInternalToPublic,
} from "@/lib/public-paths";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const STATIC_ROUTE_IDS = ["home", "about", "services", "team", "works", "blog", "contact"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [works, settings] = await Promise.all([
    prisma.work.findMany({ where: { isVisible: true }, select: { slug: true } }),
    getSettingsMapSafe(),
  ]);
  const pathMaps = parsePublicPathMapsFromSettings(settings);
  const staticPages = STATIC_ROUTE_IDS.map((id) =>
    resolveInternalToPublic(NAV_ID_INTERNAL_ROUTES[id] ?? `/${id}`, pathMaps)
  );
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
    const worksBase = resolveInternalToPublic("/works", pathMaps);
    const blogBase = resolveInternalToPublic("/blog", pathMaps);
    for (const work of works) {
      entries.push({
        url: `${baseUrl}/${locale}${worksBase}/${work.slug}`,
        lastModified: new Date(),
      });
    }
    for (const post of posts) {
      entries.push({
        url: `${baseUrl}/${locale}${blogBase}/${post.slug}`,
        lastModified: new Date(),
      });
    }
  }

  return entries;
}
