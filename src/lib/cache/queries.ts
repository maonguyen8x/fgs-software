import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { CACHE_TAGS } from "./tags";
import { withRedisCache } from "./redis-store";
import { fetchVisibleActivities } from "./activities-query";

const REVALIDATE_SECONDS = 300;

function redisKey(suffix: string): string {
  return `fgs:${suffix}`;
}

export const getCachedSettings = unstable_cache(
  async () =>
    withRedisCache(redisKey("settings"), async () => {
      const rows = await prisma.setting.findMany();
      return rows.reduce<Record<string, string>>((acc, row) => {
        acc[row.key] = row.value;
        return acc;
      }, {});
    }, REVALIDATE_SECONDS),
  ["settings-map"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.settings] }
);

export const getCachedServices = unstable_cache(
  async (visibleOnly: boolean) =>
    withRedisCache(redisKey(`services:${visibleOnly}`), () =>
      prisma.service.findMany({
        where: visibleOnly ? { isVisible: true } : undefined,
        orderBy: { order: "asc" },
      }), REVALIDATE_SECONDS),
  ["services-list"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.services] }
);

export const getCachedTeam = unstable_cache(
  async (visibleOnly: boolean, featuredOnly?: boolean) =>
    withRedisCache(redisKey(`team:${visibleOnly}:${Boolean(featuredOnly)}`), () =>
      prisma.teamMember.findMany({
        where: {
          ...(visibleOnly ? { isVisible: true } : {}),
          ...(featuredOnly ? { featured: true } : {}),
        },
        orderBy: { order: "asc" },
      }), REVALIDATE_SECONDS),
  ["team-list"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.team] }
);

export const getCachedWorks = unstable_cache(
  async (visibleOnly: boolean, category?: string) =>
    withRedisCache(redisKey(`works:${visibleOnly}:${category ?? "all"}`), () =>
      prisma.work.findMany({
        where: {
          ...(visibleOnly ? { isVisible: true } : {}),
          ...(category && category !== "all" ? { category } : {}),
        },
        orderBy: { order: "asc" },
      }), REVALIDATE_SECONDS),
  ["works-list"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.works] }
);

export const getCachedStats = unstable_cache(
  async () =>
    withRedisCache(redisKey("stats"), () =>
      prisma.stat.findMany({
        where: { isVisible: true },
        orderBy: { order: "asc" },
      }), REVALIDATE_SECONDS),
  ["stats-list"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.stats] }
);

export const getCachedWhyChooseUs = unstable_cache(
  async () =>
    withRedisCache(redisKey("why-choose-us"), () =>
      prisma.whyChooseUs.findMany({
        where: { isVisible: true },
        orderBy: { order: "asc" },
      }), REVALIDATE_SECONDS),
  ["why-choose-us"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.whyChooseUs] }
);

export const getCachedAboutContent = unstable_cache(
  async () => prisma.aboutContent.findMany({ orderBy: { section: "asc" } }),
  ["about-content"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.about] }
);

export const getCachedFounders = unstable_cache(
  async () =>
    prisma.founder.findMany({
      where: { isVisible: true },
      orderBy: { order: "asc" },
    }),
  ["founders-list"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.founders] }
);

export const getCachedTimeline = unstable_cache(
  async () =>
    prisma.timelineMilestone.findMany({
      where: { isVisible: true },
      orderBy: { order: "asc" },
    }),
  ["timeline-list"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.timeline] }
);

export const getCachedActivities = unstable_cache(
  async () => fetchVisibleActivities(),
  ["activities-list"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.activities] }
);

export const getCachedCoreValues = unstable_cache(
  async () =>
    withRedisCache(redisKey("core-values"), () =>
      prisma.coreValue.findMany({
        where: { isVisible: true },
        orderBy: { order: "asc" },
      }), REVALIDATE_SECONDS),
  ["core-values-list"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.coreValues] }
);

export const getCachedBlogPosts = unstable_cache(
  async (publishedOnly: boolean) =>
    withRedisCache(redisKey(`blog:${publishedOnly}`), () =>
      prisma.blogPost.findMany({
        where: publishedOnly ? { status: "published" } : undefined,
        orderBy: { publishedAt: "desc" },
      }), REVALIDATE_SECONDS),
  ["blog-list"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.blog] }
);

export const getCachedBranches = unstable_cache(
  async () =>
    withRedisCache(redisKey("branches"), () =>
      prisma.companyBranch.findMany({
        where: { isVisible: true },
        orderBy: { order: "asc" },
      }), REVALIDATE_SECONDS),
  ["branches-list"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.branches] }
);

export const getCachedHeroScrollSlides = unstable_cache(
  async () =>
    withRedisCache(redisKey("hero-slides"), () =>
      prisma.heroScrollSlide.findMany({
        where: { isVisible: true },
        orderBy: { order: "asc" },
      }), REVALIDATE_SECONDS),
  ["hero-slides-list"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.heroSlides] }
);

export const getCachedPartners = unstable_cache(
  async () =>
    withRedisCache(redisKey("partners"), () =>
      prisma.partner.findMany({
        where: { isVisible: true },
        orderBy: { order: "asc" },
      }), REVALIDATE_SECONDS),
  ["partners-list"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.partners] }
);

export const getCachedTestimonials = unstable_cache(
  async (limit: number) =>
    withRedisCache(redisKey(`testimonials:${limit}`), () =>
      prisma.testimonial.findMany({
        where: { isVisible: true },
        orderBy: { order: "asc" },
        take: limit,
      }), REVALIDATE_SECONDS),
  ["testimonials-list"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.testimonials] }
);

export const getCachedTechStack = unstable_cache(
  async () =>
    prisma.techStack.findMany({
      where: { isVisible: true },
      orderBy: { order: "asc" },
    }),
  ["tech-stack"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.techStack] }
);

export const getCachedChatKnowledge = unstable_cache(
  async () => {
    const [
      services,
      works,
      whyItems,
      stats,
      settings,
      aboutSections,
      founders,
      timeline,
      coreValues,
      branches,
    ] = await Promise.all([
      prisma.service.findMany({ where: { isVisible: true }, orderBy: { order: "asc" }, take: 10 }),
      prisma.work.findMany({ where: { isVisible: true }, orderBy: { order: "asc" }, take: 6 }),
      prisma.whyChooseUs.findMany({ where: { isVisible: true }, orderBy: { order: "asc" }, take: 6 }),
      prisma.stat.findMany({ where: { isVisible: true }, orderBy: { order: "asc" } }),
      prisma.setting.findMany(),
      prisma.aboutContent.findMany({ orderBy: { section: "asc" } }),
      prisma.founder.findMany({ where: { isVisible: true }, orderBy: { order: "asc" }, take: 6 }),
      prisma.timelineMilestone.findMany({ where: { isVisible: true }, orderBy: { order: "asc" }, take: 8 }),
      prisma.coreValue.findMany({ where: { isVisible: true }, orderBy: { order: "asc" }, take: 6 }),
      prisma.companyBranch.findMany({ where: { isVisible: true }, orderBy: { order: "asc" } }),
    ]);
    return {
      services,
      works,
      whyItems,
      stats,
      settings,
      aboutSections,
      founders,
      timeline,
      coreValues,
      branches,
    };
  },
  ["chat-knowledge-raw"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.settings, CACHE_TAGS.services, CACHE_TAGS.works] }
);
