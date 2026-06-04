import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import type { founderSchema } from "@/lib/admin/founder-schema";

type FounderUpdateInput = z.infer<typeof founderSchema>;
type PartialFounder = Partial<FounderUpdateInput>;

export function buildFounderUpdateData(data: PartialFounder): Prisma.FounderUpdateInput {
  const out: Prisma.FounderUpdateInput = {};
  if (data.name !== undefined) out.name = data.name;
  if (data.role !== undefined) out.role = data.role;
  if (data.roleJa !== undefined) out.roleJa = data.roleJa || null;
  if (data.roleVi !== undefined) out.roleVi = data.roleVi || null;
  if (data.slogan !== undefined) out.slogan = data.slogan || null;
  if (data.sloganJa !== undefined) out.sloganJa = data.sloganJa || null;
  if (data.sloganVi !== undefined) out.sloganVi = data.sloganVi || null;
  if (data.bio !== undefined) out.bio = data.bio || null;
  if (data.bioJa !== undefined) out.bioJa = data.bioJa || null;
  if (data.bioVi !== undefined) out.bioVi = data.bioVi || null;
  if (data.skills !== undefined) out.skills = data.skills;
  if (data.avatar !== undefined) out.avatar = data.avatar || null;
  if (data.order !== undefined) out.order = data.order;
  if (data.isVisible !== undefined) out.isVisible = data.isVisible;
  return out;
}

export function sanitizeAvatarUrl(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  return url.trim().split("?")[0] || undefined;
}
