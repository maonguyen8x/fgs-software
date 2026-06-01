import { logger } from "@/lib/logger";
import { blocksToMap, type PageBlockMap, type PublicPageId } from "@/lib/page-content";
import { getCachedAllPageBlocks } from "./page-blocks";

export async function fetchPageBlockMap(page: PublicPageId): Promise<PageBlockMap> {
  try {
    const all = await getCachedAllPageBlocks();
    const filtered = all.filter((b) => b.page === page && b.isVisible);
    return blocksToMap(filtered);
  } catch (error) {
    logger.warn("Page blocks fetch failed", {
      page,
      message: error instanceof Error ? error.message : String(error),
    });
    return {};
  }
}
