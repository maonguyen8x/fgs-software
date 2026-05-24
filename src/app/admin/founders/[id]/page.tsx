import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { FounderForm } from "@/components/admin/FounderForm";

export default async function EditFounderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const founder = await prisma.founder.findUnique({ where: { id } });
  if (!founder) notFound();

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Edit Founder</h1>
      <FounderForm initial={founder} />
    </div>
  );
}
