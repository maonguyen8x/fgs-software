import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ServiceForm } from "@/components/admin/ServiceForm";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();
  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Edit Service</h1>
      <ServiceForm initial={service} />
    </div>
  );
}
