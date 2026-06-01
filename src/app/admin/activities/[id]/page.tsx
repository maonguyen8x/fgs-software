import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ActivityForm } from "@/components/admin/ActivityForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.companyActivity.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div className="p-8">
      <AdminPageHeader title="Edit Activity" backHref="/admin/activities" />
      <ActivityForm initial={item} />
    </div>
  );
}
