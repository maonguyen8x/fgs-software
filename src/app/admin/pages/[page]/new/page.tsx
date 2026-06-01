import { notFound } from "next/navigation";
import { PageBlockForm } from "@/components/admin/PageBlockForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { isPublicPageId } from "@/lib/page-content";

export default async function NewPageBlockPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  if (!isPublicPageId(page)) notFound();

  return (
    <div className="p-8">
      <AdminPageHeader title={`New block — ${page}`} backHref={`/admin/pages?page=${page}`} />
      <PageBlockForm page={page} />
    </div>
  );
}
