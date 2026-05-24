import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { isDefaultAdminLoginDisabled } from "@/config/admin";
import { authOptions } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminIntlShell } from "@/components/admin/AdminIntlShell";

export default async function AdminLoginPage() {
  if (isDefaultAdminLoginDisabled()) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/admin/settings");
  }

  return (
    <AdminIntlShell>
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
        <AdminLoginForm />
      </Suspense>
    </AdminIntlShell>
  );
}
