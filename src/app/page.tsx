import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { defaultLocale, locales } from "@/i18n/routing";

function detectLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) return defaultLocale;
  const langs = acceptLanguage.split(",").map((l) => l.split(";")[0].trim().toLowerCase());
  for (const lang of langs) {
    if (lang.startsWith("ja")) return "ja";
    if (lang.startsWith("vi")) return "vi";
    if (lang.startsWith("en")) return "en";
  }
  return defaultLocale;
}

export default async function RootPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  const locale = detectLocale(acceptLanguage);
  if (!locales.includes(locale as "en" | "ja" | "vi")) {
    redirect(`/${defaultLocale}`);
  }
  redirect(`/${locale}`);
}
