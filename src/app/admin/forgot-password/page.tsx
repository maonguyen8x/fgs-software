import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/admin/ForgotPasswordForm";
import { AdminIntlShell } from "@/components/admin/AdminIntlShell";

export default function AdminForgotPasswordPage() {
  return (
    <AdminIntlShell>
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
        <ForgotPasswordForm loginHref="/admin/login" />
      </Suspense>
    </AdminIntlShell>
  );
}
