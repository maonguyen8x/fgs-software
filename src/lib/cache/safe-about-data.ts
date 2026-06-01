import { logger } from "@/lib/logger";
import {
  getCachedAboutContent,
  getCachedBranches,
  getCachedCoreValues,
  getCachedFounders,
  getCachedTimeline,
  getCachedActivities,
  getCachedWhyChooseUs,
} from "./queries";
import type {
  AboutContent,
  CompanyActivity,
  CompanyBranch,
  CoreValue,
  Founder,
  TimelineMilestone,
  WhyChooseUs,
} from "@prisma/client";

export interface AboutPageData {
  aboutSections: AboutContent[];
  timeline: TimelineMilestone[];
  activities: CompanyActivity[];
  coreValues: CoreValue[];
  branches: CompanyBranch[];
  founders: Founder[];
  whyItems: WhyChooseUs[];
  dataLoadFailed: boolean;
}

const EMPTY_ABOUT_DATA: AboutPageData = {
  aboutSections: [],
  timeline: [],
  activities: [],
  coreValues: [],
  branches: [],
  founders: [],
  whyItems: [],
  dataLoadFailed: true,
};

function settled<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

export async function fetchAboutPageData(): Promise<AboutPageData> {
  const results = await Promise.allSettled([
    getCachedAboutContent(),
    getCachedTimeline(),
    getCachedActivities(),
    getCachedCoreValues(),
    getCachedBranches(),
    getCachedFounders(),
    getCachedWhyChooseUs(),
  ]);

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    for (const f of failed) {
      if (f.status === "rejected") {
        logger.error("About page partial fetch failed", {
          message: f.reason instanceof Error ? f.reason.message : String(f.reason),
        });
      }
    }
  }

  if (failed.length === results.length) {
    return EMPTY_ABOUT_DATA;
  }

  return {
    aboutSections: settled(results[0], []),
    timeline: settled(results[1], []),
    activities: settled(results[2], []),
    coreValues: settled(results[3], []),
    branches: settled(results[4], []),
    founders: settled(results[5], []),
    whyItems: settled(results[6], []),
    dataLoadFailed: failed.length > 0,
  };
}
