import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { isDefaultAdminLoginDisabled } from "@/config/admin";
import { authOptions } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminIntlShell } from "@/components/admin/AdminIntlShell";
import { AdminSessionProvider } from "@/components/providers/AdminSessionProvider";
import { Toaster } from "sonner";

export default async function AdminLoginPage() {
  if (isDefaultAdminLoginDisabled()) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/admin/settings/site");
  }

  return (
    <AdminIntlShell>
      <AdminSessionProvider>
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
          <AdminLoginForm />
        </Suspense>
        <Toaster position="top-right" richColors={false} closeButton />
      </AdminSessionProvider>
    </AdminIntlShell>
  );
}
