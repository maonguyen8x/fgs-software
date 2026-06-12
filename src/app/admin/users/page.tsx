import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { getAdminLoginUrl } from "@/config/admin";
import { authOptions } from "@/lib/auth";
import { isSuperAdminRole } from "@/lib/admin-roles";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminUsersPanel } from "@/components/admin/AdminUsersPanel";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(getAdminLoginUrl());
  if (!isSuperAdminRole(session.user.role)) redirect("/admin/dashboard");

  const t = await getTranslations("admin.users");

  return (
    <AdminPageShell title={t("page_title")} description={t("page_desc")} unboxed>
      <AdminUsersPanel />
    </AdminPageShell>
  );
}
