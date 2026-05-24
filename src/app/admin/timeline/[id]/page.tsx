import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { TimelineForm } from "@/components/admin/TimelineForm";

export default async function EditTimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.timelineMilestone.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Edit Milestone</h1>
      <TimelineForm initial={item} />
    </div>
  );
}
