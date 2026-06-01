import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { CACHE_TAGS } from "./tags";

export const getCachedAllPageBlocks = unstable_cache(
  async () =>
    prisma.pageContentBlock.findMany({
      orderBy: [{ page: "asc" }, { order: "asc" }],
    }),
  ["page-blocks-all"],
  { revalidate: 300, tags: [CACHE_TAGS.pageBlocks] }
);
