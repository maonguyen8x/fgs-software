import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageBlockForm } from "@/components/admin/PageBlockForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { isPublicPageId } from "@/lib/page-content";

export default async function EditPageBlockPage({
  params,
}: {
  params: Promise<{ page: string; id: string }>;
}) {
  const { page, id } = await params;
  if (!isPublicPageId(page)) notFound();

  const block = await prisma.pageContentBlock.findUnique({ where: { id } });
  if (!block || block.page !== page) notFound();

  return (
    <div className="p-8">
      <AdminPageHeader title={`Edit block — ${block.key}`} backHref={`/admin/pages?page=${page}`} />
      <PageBlockForm page={page} initial={block} />
    </div>
  );
}
