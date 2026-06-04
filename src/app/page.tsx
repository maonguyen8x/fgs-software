import { redirect } from "next/navigation";
import { getSiteDefaultLocale } from "@/lib/site-default-locale";

export default async function RootPage() {
  const locale = await getSiteDefaultLocale();
  redirect(`/${locale}`);
}
