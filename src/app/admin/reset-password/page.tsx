import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/admin/ResetPasswordForm";
import { AdminIntlShell } from "@/components/admin/AdminIntlShell";

export default function AdminResetPasswordPage() {
  return (
    <AdminIntlShell>
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
        <ResetPasswordForm loginHref="/admin/login" />
      </Suspense>
    </AdminIntlShell>
  );
}
