import { z } from "zod";

export const updateProfileSchema = z.object({
  naam: z.string().trim().min(1).optional(),
  email: z.string().trim().toLowerCase().email(),
  clubId: z.string().min(1).nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
