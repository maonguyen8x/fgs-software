import { logger } from "@/lib/logger";
import {
  getCachedPartners,
  getCachedServices,
  getCachedSettings,
  getCachedStats,
  getCachedTeam,
  getCachedTestimonials,
  getCachedTechStack,
  getCachedWhyChooseUs,
  getCachedWorks,
} from "./queries";
import type {
  Partner,
  Service,
  Stat,
  TeamMember,
  TechStack,
  Testimonial,
  WhyChooseUs,
  Work,
} from "@prisma/client";

export interface HomePageData {
  settings: Record<string, string>;
  stats: Stat[];
  allServices: Service[];
  whyItems: WhyChooseUs[];
  allTeam: TeamMember[];
  allWorks: Work[];
  testimonials: Testimonial[];
  partners: Partner[];
  techStack: TechStack[];
  dataLoadFailed: boolean;
}

const EMPTY_HOME_DATA: HomePageData = {
  settings: {},
  stats: [],
  allServices: [],
  whyItems: [],
  allTeam: [],
  allWorks: [],
  testimonials: [],
  partners: [],
  techStack: [],
  dataLoadFailed: true,
};

const FETCH_TIMEOUT_MS = 15000;

function createTimeoutPromise<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Data fetch timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

export async function fetchHomePageData(): Promise<HomePageData> {
  try {
    const [settings, stats, allServices, whyItems, allTeam, allWorks, testimonials, partners, techStack] =
      await createTimeoutPromise(
        Promise.all([
          getCachedSettings(),
          getCachedStats(),
          getCachedServices(true),
          getCachedWhyChooseUs(),
          getCachedTeam(true, true),
          getCachedWorks(true),
          getCachedTestimonials(3),
          getCachedPartners(),
          getCachedTechStack(),
        ]),
        FETCH_TIMEOUT_MS
      );

    return {
      settings,
      stats,
      allServices,
      whyItems,
      allTeam,
      allWorks,
      testimonials,
      partners,
      techStack,
      dataLoadFailed: false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Homepage data fetch failed", {
      message: errorMessage,
      timeout: errorMessage.includes("timeout"),
    });
    return EMPTY_HOME_DATA;
  }
}
