# Plan: Vastspelen-tool A-categorie (1e en 2e team)

## Doel

Teamleiders van het 1e en 2e team een preventief hulpmiddel geven om vastspelen (KNKV A-categorie, "eigen team"-regel) te voorkomen. Geen naleving-achteraf-tool, maar een check-vooraf bij het opstellen van een team.

**Scope:** alleen A-categorie, alleen 1e en 2e team, alleen de rol teamleider. Geen clubbreed dashboard, geen rollenbeheer, geen koppeling met Sportlink/DWF.

## Uitgangspunten uit het KNKV-reglement

- "Gespeeld" = minimaal 75% van de wedstrijdduur in een team.
- **Eigen team** wordt bepaald over de laatste 3 gespeelde wedstrijden binnen een seizoensdeel (veld/zaal apart): het laagste team waarin een speler in die 3 wedstrijden heeft gespeeld, volgens de 65%-regel.
- Max. 2 spelers per wedstrijd mogen invallen vanuit een lager team, tot en met driekwart van de competitie.
- Uitzonderingen: opvolgende-wedstrijd-uitzondering, gelijke-klasse-uitzondering, 45-dagen-afwezigheidsreset.
- Voor dit plan is alleen 1e/2e team relevant: het enige "hogere team" waar 2e-teamspelers kunnen invallen is het 1e team, en andersom is er geen lager team dan het 2e team binnen scope. Dit vereenvoudigt de invalbeurten-logica aanzienlijk t.o.v. een clubbrede opzet met 3+ teams.

## Databron

- **Programma-API** (extern, alleen-lezen): levert wedstrijden — datum, team, tegenstander, poule, speelweeknummer. Wordt periodiek gesynchroniseerd, geen koppeling voor spelers/minuten.
- **Alles overig is handmatige invoer door de teamleider**: welke spelers hebben gespeeld, in welk team, en hoeveel minuten.

## Datamodel (Prisma/Postgres, monorepo-conventie aanhouden)

```prisma
model Team {
  id        String   @id @default(cuid())
  naam      String
  niveau    Int      // 1 of 2
  categorie String   @default("A")
  spelers   Player[]
  fixtures  Fixture[]
}

model Player {
  id             String   @id @default(cuid())
  naam           String
  geboortedatum  DateTime
  team           Team     @relation(fields: [teamId], references: [id])
  teamId         String
  appearances    Appearance[]
}

model Fixture {
  id            String   @id @default(cuid())
  externalId    String   @unique   // id uit programma-API, voor idempotente sync
  team          Team     @relation(fields: [teamId], references: [id])
  teamId        String
  tegenstander  String
  datum         DateTime
  poule         String
  speelweek     Int
  seizoensdeel  String   // "veld" | "zaal"
  wedstrijdduur Int      // minuten, default instelbaar
  appearances   Appearance[]
}

model Appearance {
  id                 String   @id @default(cuid())
  fixture            Fixture  @relation(fields: [fixtureId], references: [id])
  fixtureId          String
  player             Player   @relation(fields: [playerId], references: [id])
  playerId           String
  gespeeldInTeamId   String   // team waarin dit gespeeld is (kan afwijken van player.teamId bij invalbeurt)
  minuten            Int
}

model SeasonPeriod {
  id            String   @id @default(cuid())
  naam          String   // "Veld 2026", "Zaal 2026/2027"
  start         DateTime
  eind          DateTime
  totaalWedstrijden Int  // voor de driekwart-grens
}
```

## Rekenlogica (losse, testbare functies)

Plaats in `packages/vastspelen-logic` (of vergelijkbare gedeelde package binnen de monorepo) zodat de logica los van UI getest kan worden.

```ts
heeftGespeeld(appearance, wedstrijdduur): boolean
// true als minuten / wedstrijdduur >= 0.75

gespeeldeWedstrijden(playerId, seizoensdeel, tot?: speelweek): Appearance[]
// alle appearances van een speler die aan heeftGespeeld voldoen, gesorteerd op speelweek

eigenTeam(playerId, seizoensdeel, tot?: speelweek): TeamNiveau | null
// laatste 3 gespeelde wedstrijden -> laagste team volgens 65%-regel
// null zolang er nog geen 3 gespeelde wedstrijden zijn

invalbeurtenGebruikt(playerId, seizoensdeel): number
// aantal keer gespeeld in 1e team terwijl player.teamId === 2e team (of vice versa, alleen relevant voor 2e-team-spelers die invallen in 1e)

binnenDriekwartCompetitie(fixture, seasonPeriod): boolean

magOpstellen(playerId, teamNiveau, fixture): { toegestaan: boolean; reden?: string }
// combineert eigenTeam + invalbeurtenGebruikt + driekwart-grens + 45-dagen-reset
```

Bouw eerst `eigenTeam()` en `invalbeurtenGebruikt()` met losstaande unit tests (KNKV-voorbeeldcasussen als testcases) vóórdat de UI eraan gekoppeld wordt.

## Flow

```
1. Sync programma-API -> Fixture-records aanmaken/updaten (idempotent op externalId)
2. Teamleider logt in, ziet spelerslijst van zijn team met status:
   🟢 vrij inzetbaar  🟠 laatste invalbeurt  🔴 zou vastspelen veroorzaken
3. "Opstelling checken" vóór wedstrijd:
   - teamleider vinkt spelers aan (incl. evt. invaller uit het andere team)
   - magOpstellen() per speler -> resultaat + uitleg
4. Na de wedstrijd: minuten per speler invoeren (gekoppeld aan de fixture)
5. Statussen (eigenTeam, invalbeurtenGebruikt) automatisch herberekend
```

## Openstaande ontwerpkeuze

Teamleiders hebben overlappende zichtbaarheid nodig: een 2e-teamleider moet ook 1e-teamspelers kunnen zien/invoeren wanneer die in het 2e team invallen (en vice versa), anders klopt de invalbeurten-teller niet. Voorstel: spelerslijst is gedeeld tussen beide teamleiders binnen A-categorie, niet per team afgeschermd.

## Fasering

1. **Fase 1 — fundament:** Prisma-schema, programma-API-sync, seed data voor 1e/2e team spelers
2. **Fase 2 — rekenlogica:** `eigenTeam`, `invalbeurtenGebruikt`, `magOpstellen` als geïsoleerd getest package
3. **Fase 3 — invoer-UI:** wedstrijd-na-afloop invoerscherm (minuten per speler)
4. **Fase 4 — check-vooraf-UI:** opstelling samenstellen + live validatie, de kernfunctie
5. **Fase 5 — status-dashboard:** spelerslijst met stoplicht-overzicht per teamleider

## Niet in scope (bewust)

- B-categorie / leeftijdsregels
- Clubbreed dashboard / technische commissie
- Rollen- en rechtenbeheer buiten teamleider
- Sportlink/DWF-koppeling voor automatische opstelling/minuten
