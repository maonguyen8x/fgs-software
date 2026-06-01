import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { LOGO_MODE_KEY, LOGO_URL_KEY, resolveLogoDisplay } from "@/lib/brand-logo";

export const getAdminBranding = unstable_cache(
  async () => {
    const rows = await prisma.setting.findMany({
      where: { key: { in: [LOGO_URL_KEY, LOGO_MODE_KEY] } },
      select: { key: true, value: true },
    });
    const map = rows.reduce<Record<string, string>>((acc, r) => {
      acc[r.key] = r.value;
      return acc;
    }, {});
    const { mode, url } = resolveLogoDisplay(map);
    return { logoMode: mode, logoUrl: url };
  },
  ["admin-branding"],
  { revalidate: 30, tags: ["settings"] }
);
