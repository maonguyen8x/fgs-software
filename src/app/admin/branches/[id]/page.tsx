import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { BranchForm } from "@/components/admin/BranchForm";

export default async function EditBranchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const branch = await prisma.companyBranch.findUnique({ where: { id } });
  if (!branch) notFound();

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Edit Branch</h1>
      <BranchForm initial={branch} />
    </div>
  );
}
