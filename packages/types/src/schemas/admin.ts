import { z } from "zod";
import { CAPABILITIES, ROLES } from "../role";

export const updateUserRoleSchema = z.object({
  role: z.enum(ROLES),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

// null clears the club (e.g. user leaves their club).
export const updateUserClubSchema = z.object({
  clubId: z.string().min(1).nullable(),
});

export type UpdateUserClubInput = z.infer<typeof updateUserClubSchema>;

export const updateUserCapabilitiesSchema = z.object({
  capabilities: z.array(z.enum(CAPABILITIES)),
});

export type UpdateUserCapabilitiesInput = z.infer<typeof updateUserCapabilitiesSchema>;

export const resetPasswordSchema = z.object({
  mode: z.enum(["temporary_password", "reset_link"]).default("reset_link"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// Consumed by the public /reset-password page after the user follows the
// emailed link (not admin-only, unlike the schema above).
export const confirmPasswordResetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Wachtwoord moet minimaal 8 tekens zijn"),
});

export type ConfirmPasswordResetInput = z.infer<typeof confirmPasswordResetSchema>;
