import type { Founder, TeamMember } from "@prisma/client";
import { prisma } from "@/lib/db";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";

export interface FounderPayload {
  name: string;
  role: string;
  roleJa?: string;
  roleVi?: string;
  slogan?: string;
  sloganJa?: string;
  sloganVi?: string;
  bio?: string;
  bioJa?: string;
  bioVi?: string;
  avatar?: string;
  skills: string[];
  order: number;
  isVisible: boolean;
}

function teamDataFromFounder(payload: FounderPayload) {
  return {
    name: payload.name,
    role: payload.role,
    roleJa: payload.roleJa ?? null,
    roleVi: payload.roleVi ?? null,
    bio: payload.bio ?? null,
    bioJa: payload.bioJa ?? null,
    bioVi: payload.bioVi ?? null,
    avatar: payload.avatar ?? null,
    skills: payload.skills,
    order: payload.order,
    isVisible: payload.isVisible,
    featured: true,
  };
}

export async function syncFounderToTeam(
  founder: Founder,
  payload: FounderPayload
): Promise<TeamMember> {
  const teamData = teamDataFromFounder(payload);

  if (founder.teamMemberId) {
    const linked = await prisma.teamMember.findUnique({
      where: { id: founder.teamMemberId },
    });
    if (linked) {
      const updated = await prisma.teamMember.update({
        where: { id: founder.teamMemberId },
        data: teamData,
      });
      afterAdminMutation(CACHE_TAGS.team);
      return updated;
    }
  }

  const created = await prisma.teamMember.create({ data: teamData });
  await prisma.founder.update({
    where: { id: founder.id },
    data: { teamMemberId: created.id },
  });
  afterAdminMutation(CACHE_TAGS.team);
  return created;
}

export async function removeFounderTeamLink(founderId: string, teamMemberId: string | null) {
  if (!teamMemberId) return;
  await prisma.teamMember.delete({ where: { id: teamMemberId } }).catch(() => undefined);
  await prisma.founder.update({
    where: { id: founderId },
    data: { teamMemberId: null },
  });
  afterAdminMutation(CACHE_TAGS.team);
}
