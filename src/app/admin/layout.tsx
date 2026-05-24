import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { Toaster } from "sonner";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminLoginSuccessToast } from "@/components/admin/AdminLoginSuccessToast";
import { AdminIntlShell } from "@/components/admin/AdminIntlShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <AdminIntlShell>
      <div className="flex min-h-screen bg-surface-muted">
        {session && <AdminSidebar userName={session.user?.name ?? "Admin"} />}
        <main className="flex-1 overflow-auto bg-surface-muted">{children}</main>
        <Suspense fallback={null}>
          <AdminLoginSuccessToast />
        </Suspense>
        <Toaster
          position="top-right"
          richColors={false}
          closeButton
          toastOptions={{ className: "!z-[9999]" }}
        />
      </div>
    </AdminIntlShell>
  );
}
