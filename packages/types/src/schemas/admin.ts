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

export const updateUserStatusSchema = z.object({
  deactivated: z.boolean(),
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;

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

// Admin creates the account; the user sets their own password via an
// emailed invite link (same mechanism as resetPasswordSchema's "reset_link"
// mode) rather than the admin choosing a password for them.
export const createUserSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  naam: z.string().trim().min(1).optional(),
  role: z.enum(ROLES).default("player"),
  capabilities: z.array(z.enum(CAPABILITIES)).default([]),
  clubId: z.string().min(1).nullable().default(null),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const createClubSchema = z.object({
  naam: z.string().trim().min(1, "Naam is verplicht"),
});

export type CreateClubInput = z.infer<typeof createClubSchema>;

export const updateClubSchema = z.object({
  naam: z.string().trim().min(1, "Naam is verplicht"),
});

export type UpdateClubInput = z.infer<typeof updateClubSchema>;

export const updateAppConfigSchema = z.object({
  title: z.string().min(1, "Titel is verplicht"),
  imageUrl: z.string().url("Ongeldige URL").nullable(),
  visible: z.boolean(),
});

export const updatePlatformSettingsSchema = z.object({
  maintenanceMode: z.boolean(),
});

export type UpdatePlatformSettingsInput = z.infer<typeof updatePlatformSettingsSchema>;

export type UpdateAppConfigInput = z.infer<typeof updateAppConfigSchema>;
