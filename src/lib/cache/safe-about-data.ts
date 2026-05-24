import { logger } from "@/lib/logger";
import {
  getCachedAboutContent,
  getCachedBranches,
  getCachedCoreValues,
  getCachedFounders,
  getCachedTimeline,
  getCachedWhyChooseUs,
} from "./queries";
import type {
  AboutContent,
  CompanyBranch,
  CoreValue,
  Founder,
  TimelineMilestone,
  WhyChooseUs,
} from "@prisma/client";

export interface AboutPageData {
  aboutSections: AboutContent[];
  timeline: TimelineMilestone[];
  coreValues: CoreValue[];
  branches: CompanyBranch[];
  founders: Founder[];
  whyItems: WhyChooseUs[];
  dataLoadFailed: boolean;
}

const EMPTY_ABOUT_DATA: AboutPageData = {
  aboutSections: [],
  timeline: [],
  coreValues: [],
  branches: [],
  founders: [],
  whyItems: [],
  dataLoadFailed: true,
};

export async function fetchAboutPageData(): Promise<AboutPageData> {
  try {
    const [aboutSections, timeline, coreValues, branches, founders, whyItems] =
      await Promise.all([
        getCachedAboutContent(),
        getCachedTimeline(),
        getCachedCoreValues(),
        getCachedBranches(),
        getCachedFounders(),
        getCachedWhyChooseUs(),
      ]);

    return {
      aboutSections,
      timeline,
      coreValues,
      branches,
      founders,
      whyItems,
      dataLoadFailed: false,
    };
  } catch (error) {
    logger.error("About page data fetch failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return EMPTY_ABOUT_DATA;
  }
}
