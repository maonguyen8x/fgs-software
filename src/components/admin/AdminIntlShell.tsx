import { AdminIntlProvider } from "@/components/admin/AdminIntlProvider";
import { loadMessages, resolveLocaleFromCookies } from "@/lib/i18n/resolve-locale";

export async function AdminIntlShell({ children }: { children: React.ReactNode }) {
  const locale = await resolveLocaleFromCookies();
  const messages = await loadMessages(locale);
  return (
    <AdminIntlProvider locale={locale} messages={messages}>
      {children}
    </AdminIntlProvider>
  );
}
