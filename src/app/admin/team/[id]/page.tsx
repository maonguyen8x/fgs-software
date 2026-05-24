import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { TeamForm } from "@/components/admin/TeamForm";

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await prisma.teamMember.findUnique({ where: { id } });
  if (!member) notFound();

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Edit: {member.name}</h1>
      <TeamForm initial={member} />
    </div>
  );
}
