import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { WorkForm } from "@/components/admin/WorkForm";

export default async function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const work = await prisma.work.findUnique({ where: { id } });
  if (!work) notFound();

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Edit Work</h1>
      <WorkForm initial={work} />
    </div>
  );
}
