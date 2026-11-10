import Link from "next/link";
import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { DeleteTeamButton } from "@/components/admin/DeleteTeamButton";
import { TeamAdminTabs, type TeamAdminTab } from "@/components/admin/TeamAdminTabs";
import { FoundersAdminTable } from "@/components/admin/FoundersAdminTable";
import { AboutUsContentPanel, type AboutUsDefaults } from "@/components/admin/AboutUsContentPanel";
import { getSettingsMap } from "@/lib/settings";
import enMessages from "../../../../messages/en.json";
import jaMessages from "../../../../messages/ja.json";
import viMessages from "../../../../messages/vi.json";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminContentBlock } from "@/components/admin/AdminContentBlock";

const TEAM_MESSAGES = { en: enMessages.team, ja: jaMessages.team, vi: viMessages.team };

function buildDefaults(): AboutUsDefaults {
  const pick = (read: (m: typeof enMessages.team) => string) => ({
    en: read(TEAM_MESSAGES.en),
    ja: read(TEAM_MESSAGES.ja),
    vi: read(TEAM_MESSAGES.vi),
  });
  return {
    bubbleTitle: pick((m) => m.ceo.bubble_title),
    message: pick((m) => m.ceo.message),
    role: pick((m) => m.ceo.role),
    name: enMessages.team.ceo.name,
    signature: enMessages.team.ceo.signature,
    intro: [1, 2, 3].map((n) => pick((m) => m[`intro_block_${n}` as "intro_block_1"])),
  };
}

export default async function AdminTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;
  const tab: TeamAdminTab = tabParam === "founders" ? "founders" : tabParam === "page" ? "page" : "members";
  const t = await getTranslations("admin.team");

  const [members, founders] = await Promise.all([
    prisma.teamMember.findMany({ orderBy: { order: "asc" } }),
    prisma.founder.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <AdminPageShell title={t("title")} description={t("subtitle")} unboxed>
      <AdminContentBlock>
        <TeamAdminTabs active={tab} />

        {tab === "page" ? (
          <div className="mt-6">
            <AboutUsContentPanel settings={await getSettingsMap()} defaults={buildDefaults()} />
          </div>
        ) : tab === "members" ? (
          <>
            <div className="mb-4 mt-6 flex justify-end">
              <Button asChild className="cursor-pointer">
                <Link href="/admin/team/new">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("add_member")}
                </Link>
              </Button>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">{t("col_name")}</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">{t("col_role")}</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">{t("col_experience")}</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">{t("col_status")}</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">{t("col_actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id} className="border-t border-slate-100 transition-colors hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-medium text-slate-900">{m.name}</td>
                      <td className="px-4 py-3 text-slate-600">{m.role}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {m.experience ?? "—"} {t("years_suffix")}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={m.isVisible ? "default" : "secondary"}>
                          {m.isVisible ? t("visible") : t("hidden")}
                        </Badge>
                      </td>
                      <td className="space-x-2 px-4 py-3 text-right">
                        <Button asChild variant="outline" size="sm" className="cursor-pointer">
                          <Link href={`/admin/team/${m.id}`}>{t("edit")}</Link>
                        </Button>
                        <DeleteTeamButton id={m.id} name={m.name} />
                      </td>
                    </tr>
                  ))}
                  {members.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                        —
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-xl border border-slate-200/90 bg-white p-1 shadow-sm">
            <FoundersAdminTable
              founders={founders}
              addLabel={t("add_founder")}
              editLabel={t("edit")}
              deleteLabel={t("delete")}
              deleteConfirmTemplate={String(t.raw("delete_founder_confirm"))}
              visibleLabel={t("visible")}
              hiddenLabel={t("hidden")}
              nameCol={t("col_name")}
              roleCol={t("col_role")}
              statusCol={t("col_status")}
              actionsCol={t("col_actions")}
            />
          </div>
        )}
      </AdminContentBlock>
    </AdminPageShell>
  );
}
