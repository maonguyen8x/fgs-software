import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { founderSchema } from "@/lib/admin/founder-schema";
import { syncFounderToTeam } from "@/lib/admin/founder-team-sync";
import { logger } from "@/lib/logger";

const updateSchema = founderSchema.partial();

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  try {
    const data = updateSchema.parse(await request.json());
    const existing = await prisma.founder.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const founder = await prisma.founder.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role,
        roleJa: data.roleJa,
        roleVi: data.roleVi,
        slogan: data.slogan,
        sloganJa: data.sloganJa,
        sloganVi: data.sloganVi,
        bio: data.bio,
        bioJa: data.bioJa,
        bioVi: data.bioVi,
        skills: data.skills,
        avatar: data.avatar,
        order: data.order,
        isVisible: data.isVisible,
      },
    });

    const shouldSync = data.syncToTeam !== false;
    if (shouldSync) {
      await syncFounderToTeam(founder, {
        name: data.name ?? founder.name,
        role: data.role ?? founder.role,
        roleJa: data.roleJa ?? founder.roleJa ?? undefined,
        roleVi: data.roleVi ?? founder.roleVi ?? undefined,
        slogan: data.slogan ?? founder.slogan ?? undefined,
        sloganJa: data.sloganJa ?? founder.sloganJa ?? undefined,
        sloganVi: data.sloganVi ?? founder.sloganVi ?? undefined,
        bio: data.bio ?? founder.bio ?? undefined,
        bioJa: data.bioJa ?? founder.bioJa ?? undefined,
        bioVi: data.bioVi ?? founder.bioVi ?? undefined,
        avatar: data.avatar ?? founder.avatar ?? undefined,
        skills: data.skills ?? founder.skills,
        order: data.order ?? founder.order,
        isVisible: data.isVisible ?? founder.isVisible,
      });
    }

    afterAdminMutation(CACHE_TAGS.founders, ...(shouldSync ? [CACHE_TAGS.team] : []));
    const updated = await prisma.founder.findUnique({ where: { id } });
    return NextResponse.json(updated ?? founder);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    logger.error("Update founder failed", { error: String(e) });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  const founder = await prisma.founder.findUnique({ where: { id } });
  if (founder?.teamMemberId) {
    await prisma.teamMember.delete({ where: { id: founder.teamMemberId } }).catch(() => undefined);
    afterAdminMutation(CACHE_TAGS.team);
  }
  await prisma.founder.delete({ where: { id } });
  afterAdminMutation(CACHE_TAGS.founders);
  return NextResponse.json({ success: true });
}
