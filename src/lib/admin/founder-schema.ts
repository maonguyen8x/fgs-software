import { z } from "zod";

export const founderSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  roleJa: z.string().optional(),
  roleVi: z.string().optional(),
  slogan: z.string().optional(),
  sloganJa: z.string().optional(),
  sloganVi: z.string().optional(),
  bio: z.string().optional(),
  bioJa: z.string().optional(),
  bioVi: z.string().optional(),
  skills: z.array(z.string()).default([]),
  avatar: z.string().optional(),
  order: z.number().default(0),
  isVisible: z.boolean().default(true),
  syncToTeam: z.boolean().default(true),
});

export type FounderInput = z.infer<typeof founderSchema>;
