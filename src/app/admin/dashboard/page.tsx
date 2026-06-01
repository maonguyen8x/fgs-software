import { getTranslations } from "next-intl/server";
import { getDashboardAnalytics } from "@/lib/analytics/dashboard-stats";
import { AdminDashboardCharts } from "@/components/admin/AdminDashboardCharts";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const t = await getTranslations("admin.dashboard");
  const data = await getDashboardAnalytics();

  return (
    <AdminPageShell title={t("title")} description={t("subtitle")} unboxed>
      <AdminDashboardCharts
        data={data}
        labels={{
          visitors: t("visitors_total"),
          thisMonth: t("visitors_month"),
          unique: t("visitors_unique"),
          messages: t("messages"),
          partners: t("partners"),
          team: t("team"),
          monthlyChart: t("chart_monthly"),
          countryChart: t("chart_countries"),
          visits: t("visits"),
        }}
      />
    </AdminPageShell>
  );
}
