import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getAdminLoginUrl } from "@/config/admin";
import { isAdminPublicPath } from "@/config/admin-public-paths";
import { Toaster } from "sonner";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminLoginSuccessToast } from "@/components/admin/AdminLoginSuccessToast";
import { AdminIntlShell } from "@/components/admin/AdminIntlShell";
import { getAdminBranding } from "@/lib/admin/branding-settings";
import { AdminCrossTabRefresh } from "@/components/admin/AdminCrossTabRefresh";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminSessionProvider } from "@/components/providers/AdminSessionProvider";
import { AdminMainScroll } from "@/components/admin/AdminMainScroll";
import { AdminNavProgress } from "@/components/admin/AdminNavProgress";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (!session && pathname && !isAdminPublicPath(pathname)) {
    const loginUrl = getAdminLoginUrl();
    const qs = new URLSearchParams({ callbackUrl: pathname });
    redirect(`${loginUrl}?${qs.toString()}`);
  }
  const branding = session ? await getAdminBranding() : { logoMode: "text" as const, logoUrl: null };

  return (
    <AdminSessionProvider session={session}>
    <AdminIntlShell>
      <AdminCrossTabRefresh />
      <div className="flex h-screen min-h-0 overflow-hidden bg-surface-muted">
        {session && (
          <AdminSidebar
            userName={session.user?.name ?? "Admin"}
            logoUrl={branding.logoUrl}
            logoMode={branding.logoMode}
            userRole={session.user?.role}
          />
        )}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {session && <AdminTopBar initialName={session.user?.name ?? undefined} />}
          <main
            data-admin-scroll-root
            className="relative min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-slate-100/80"
          >
            <Suspense fallback={null}>
              <AdminMainScroll />
            </Suspense>
            <AdminNavProgress />
            {children}
          </main>
        </div>
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
    </AdminSessionProvider>
  );
}
