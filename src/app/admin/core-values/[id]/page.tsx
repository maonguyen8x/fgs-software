import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CoreValueForm } from "@/components/admin/CoreValueForm";

export default async function EditCoreValuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.coreValue.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Edit Core Value</h1>
      <CoreValueForm initial={item} />
    </div>
  );
}
