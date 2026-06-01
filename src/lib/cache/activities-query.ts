import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import type { CompanyActivity } from "@prisma/client";

export async function fetchVisibleActivities(): Promise<CompanyActivity[]> {
  try {
    return await prisma.companyActivity.findMany({
      where: { isVisible: true },
      orderBy: { order: "asc" },
    });
  } catch (error) {
    logger.error("Activities fetch failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
