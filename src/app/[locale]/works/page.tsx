import { permanentRedirect } from "next/navigation";

export default async function LegacyWorksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const [{ locale }, { category }] = await Promise.all([params, searchParams]);
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  permanentRedirect(`/${locale}/products${query}`);
}
