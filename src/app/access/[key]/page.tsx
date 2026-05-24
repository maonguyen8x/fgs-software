import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { getAdminLoginSecret } from "@/config/admin";
import { authOptions } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminIntlShell } from "@/components/admin/AdminIntlShell";

export default async function SecretAdminLoginPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const secret = getAdminLoginSecret();

  if (!secret || key !== secret) {
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
