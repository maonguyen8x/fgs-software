import { AdminIntlProvider } from "@/components/admin/AdminIntlProvider";
import { loadAdminMessages, resolveAdminLocaleFromCookies } from "@/lib/i18n/resolve-admin-locale";

export async function AdminIntlShell({ children }: { children: React.ReactNode }) {
  const locale = await resolveAdminLocaleFromCookies();
  const messages = await loadAdminMessages();
  return (
    <AdminIntlProvider locale={locale} messages={messages}>
      {children}
    </AdminIntlProvider>
  );
}
