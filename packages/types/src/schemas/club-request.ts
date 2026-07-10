import { z } from "zod";

export const reviewClubRequestSchema = z.object({
  approve: z.boolean(),
});

export type ReviewClubRequestInput = z.infer<typeof reviewClubRequestSchema>;
