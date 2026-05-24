import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { founderSchema } from "@/lib/admin/founder-schema";
import { syncFounderToTeam } from "@/lib/admin/founder-team-sync";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  try {
    const data = founderSchema.parse(await request.json());
    const founder = await prisma.founder.create({
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

    if (data.syncToTeam) {
      await syncFounderToTeam(founder, data);
    }

    afterAdminMutation(CACHE_TAGS.founders);
    const updated = await prisma.founder.findUnique({ where: { id: founder.id } });
    return NextResponse.json(updated ?? founder, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    logger.error("Create founder failed", { error: String(e) });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
