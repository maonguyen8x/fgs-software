import { prisma } from "@/lib/db";

export interface DashboardAnalytics {
  totalVisits: number;
  visitsThisMonth: number;
  uniqueSessionsThisMonth: number;
  messageCount: number;
  partnerCount: number;
  teamCount: number;
  byMonth: { month: string; label: string; count: number }[];
  byCountry: { country: string; countryCode: string; count: number; color: string }[];
}

const CHART_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#16a34a",
  "#0891b2",
  "#4f46e5",
  "#c026d3",
];

function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return `${m}/${y?.slice(2) ?? ""}`;
}

function lastMonths(count: number): string[] {
  const keys: string[] = [];
  const d = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1));
    keys.push(`${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

const EMPTY: DashboardAnalytics = {
  totalVisits: 0,
  visitsThisMonth: 0,
  uniqueSessionsThisMonth: 0,
  messageCount: 0,
  partnerCount: 0,
  teamCount: 0,
  byMonth: lastMonths(6).map((month) => ({ month, label: monthLabel(month), count: 0 })),
  byCountry: [],
};

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  if (!("siteVisit" in prisma) || typeof prisma.siteVisit?.count !== "function") {
    const [messageCount, partnerCount, teamCount] = await Promise.all([
      prisma.message.count(),
      prisma.partner.count({ where: { isVisible: true } }),
      prisma.teamMember.count({ where: { isVisible: true } }),
    ]);
    return { ...EMPTY, messageCount, partnerCount, teamCount };
  }

  const monthKeys = lastMonths(6);
  const currentMonth = monthKeys[monthKeys.length - 1]!;

  try {
  const [
    totalVisits,
    visitsThisMonth,
    sessionGroups,
    messageCount,
    partnerCount,
    teamCount,
    monthGroups,
    countryGroups,
  ] = await Promise.all([
    prisma.siteVisit.count(),
    prisma.siteVisit.count({ where: { monthKey: currentMonth } }),
    prisma.siteVisit.groupBy({
      by: ["sessionKey"],
      where: { monthKey: currentMonth },
      _count: true,
    }),
    prisma.message.count(),
    prisma.partner.count({ where: { isVisible: true } }),
    prisma.teamMember.count({ where: { isVisible: true } }),
    prisma.siteVisit.groupBy({
      by: ["monthKey"],
      where: { monthKey: { in: monthKeys } },
      _count: { _all: true },
    }),
    prisma.siteVisit.groupBy({
      by: ["countryCode", "country"],
      _count: { _all: true },
    }),
  ]);

  const monthMap = new Map(monthGroups.map((g) => [g.monthKey, g._count._all]));

  return {
    totalVisits,
    visitsThisMonth,
    uniqueSessionsThisMonth: sessionGroups.length,
    messageCount,
    partnerCount,
    teamCount,
    byMonth: monthKeys.map((month) => ({
      month,
      label: monthLabel(month),
      count: monthMap.get(month) ?? 0,
    })),
    byCountry: [...countryGroups]
      .sort((a, b) => b._count._all - a._count._all)
      .slice(0, 8)
      .map((g, i) => ({
        country: g.country,
        countryCode: g.countryCode,
        count: g._count._all,
        color: CHART_COLORS[i % CHART_COLORS.length]!,
      })),
  };
  } catch {
    const [messageCount, partnerCount, teamCount] = await Promise.all([
      prisma.message.count(),
      prisma.partner.count({ where: { isVisible: true } }),
      prisma.teamMember.count({ where: { isVisible: true } }),
    ]);
    return { ...EMPTY, messageCount, partnerCount, teamCount };
  }
}
