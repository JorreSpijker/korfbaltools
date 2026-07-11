import { z } from "zod";
import { TEAM_TYPES } from "../team";
import { GENDERS } from "../player";

export const createTeamSchema = z.object({
  naam: z.string().trim().min(1, "Naam is verplicht"),
  type: z.enum(TEAM_TYPES),
  categorie: z.string().trim().min(1, "Categorie is verplicht"),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const updateTeamSchema = createTeamSchema;

export type UpdateTeamInput = CreateTeamInput;

export const importPlayersSchema = z.object({
  players: z
    .array(
      z.object({
        naam: z.string().trim().min(1),
        geslacht: z.enum(GENDERS),
      }),
    )
    .min(1, "Geen spelers om te importeren"),
});

export type ImportPlayersInput = z.infer<typeof importPlayersSchema>;

// null = terug naar de pool (onverdeeld).
export const assignPlayerSchema = z.object({
  teamId: z.string().min(1).nullable(),
});

export type AssignPlayerInput = z.infer<typeof assignPlayerSchema>;
