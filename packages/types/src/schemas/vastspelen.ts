import { z } from "zod";

const teamNiveauSchema = z.union([z.literal(1), z.literal(2)]);

export const createVastspelenPlayerSchema = z.object({
  naam: z.string().trim().min(1, "Naam is verplicht"),
  geboortedatum: z.string().min(1, "Geboortedatum is verplicht"),
  teamNiveau: teamNiveauSchema,
});

export type CreateVastspelenPlayerInput = z.infer<typeof createVastspelenPlayerSchema>;

export const updateVastspelenPlayerSchema = z.object({
  naam: z.string().trim().min(1, "Naam is verplicht"),
  geboortedatum: z.string().min(1, "Geboortedatum is verplicht"),
  teamNiveau: teamNiveauSchema,
});

export type UpdateVastspelenPlayerInput = z.infer<typeof updateVastspelenPlayerSchema>;

export const createVastspelenSeasonPeriodSchema = z.object({
  naam: z.string().trim().min(1, "Naam is verplicht"),
  seizoensdeel: z.enum(["veld", "zaal"]),
  start: z.string().min(1, "Startdatum is verplicht"),
  eind: z.string().min(1, "Einddatum is verplicht"),
  totaalWedstrijden: z.number().int().positive(),
});

export type CreateVastspelenSeasonPeriodInput = z.infer<typeof createVastspelenSeasonPeriodSchema>;

export const createVastspelenFixtureSchema = z.object({
  teamNiveau: teamNiveauSchema,
  seasonPeriodId: z.string().min(1),
  tegenstander: z.string().trim().min(1, "Tegenstander is verplicht"),
  datum: z.string().min(1, "Datum is verplicht"),
  poule: z.string().trim().optional(),
  speelweek: z.number().int().positive(),
  wedstrijdduur: z.number().int().positive().default(60),
});

export type CreateVastspelenFixtureInput = z.infer<typeof createVastspelenFixtureSchema>;

export const updateVastspelenFixtureSchema = z.object({
  tegenstander: z.string().trim().min(1, "Tegenstander is verplicht"),
  datum: z.string().min(1, "Datum is verplicht"),
  poule: z.string().trim().optional(),
  speelweek: z.number().int().positive(),
  wedstrijdduur: z.number().int().positive(),
});

export type UpdateVastspelenFixtureInput = z.infer<typeof updateVastspelenFixtureSchema>;

export const saveVastspelenAppearancesSchema = z.object({
  appearances: z.array(
    z.object({
      playerId: z.string().min(1),
      gespeeldInTeamNiveau: teamNiveauSchema,
      minuten: z.number().int().min(0),
    }),
  ),
});

export type SaveVastspelenAppearancesInput = z.infer<typeof saveVastspelenAppearancesSchema>;

export const checkVastspelenOpstellingSchema = z.object({
  fixtureId: z.string().min(1),
  spelers: z.array(
    z.object({
      playerId: z.string().min(1),
      gespeeldInTeamNiveau: teamNiveauSchema,
    }),
  ),
});

export type CheckVastspelenOpstellingInput = z.infer<typeof checkVastspelenOpstellingSchema>;
