import { permanentRedirect } from "next/navigation";

export default async function LegacyWorkDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  permanentRedirect(`/${locale}/products/${encodeURIComponent(slug)}`);
}
