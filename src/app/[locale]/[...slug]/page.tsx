import { notFound } from "next/navigation";

const STATIC_PAGES = new Set(["about", "services", "team", "works", "contact", "blog"]);

export default async function UnknownLocalePathPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { slug } = await params;

  if (slug.length === 1 && STATIC_PAGES.has(slug[0])) {
    notFound();
  }

  if (slug.length === 2 && (slug[0] === "works" || slug[0] === "blog")) {
    notFound();
  }

  notFound();
}
