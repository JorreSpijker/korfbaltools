import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8, "Wachtwoord moet minimaal 8 tekens zijn"),
    confirmPassword: z.string(),
    naam: z.string().trim().min(1).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
