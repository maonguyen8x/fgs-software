import { getTranslations } from "next-intl/server";
import { getDashboardAnalytics } from "@/lib/analytics/dashboard-stats";
import { AdminDashboardCharts } from "@/components/admin/AdminDashboardCharts";
import { AdminVisitorsTable } from "@/components/admin/AdminVisitorsTable";
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
      <div className="mt-8">
        <AdminVisitorsTable
          visits={data.recentVisits}
          labels={{
            title: t("visitors_list_title"),
            subtitle: t("visitors_list_subtitle"),
            time: t("visitors_col_time"),
            country: t("visitors_col_country"),
            path: t("visitors_col_path"),
            session: t("visitors_col_session"),
            empty: t("visitors_empty"),
          }}
        />
      </div>
    </AdminPageShell>
  );
}
