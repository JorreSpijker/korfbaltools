import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { createVastspelenSeasonPeriodSchema } from "@korfbaltools/types";
import { requireVastspelen } from "@/lib/require-user";
import { validationErrorResponse } from "@/lib/api-response";
import { toPublicSeasonPeriod } from "@/lib/vastspelen";

// Seizoensperiodes (veld/zaal) zijn KNKV-competitiebreed, dus niet
// club-gescoped (zie packages/db schema.prisma VastspelenSeasonPeriod) —
// requireVastspelen is hier alleen de toegangscheck, geen club-filter.
export async function GET() {
  const result = await requireVastspelen();
  if ("response" in result) return result.response;

  const seasonPeriods = await prisma.vastspelenSeasonPeriod.findMany({ orderBy: { start: "desc" } });
  return NextResponse.json({ seasonPeriods: seasonPeriods.map(toPublicSeasonPeriod) });
}

export async function POST(request: NextRequest) {
  const result = await requireVastspelen();
  if ("response" in result) return result.response;

  const body = await request.json().catch(() => null);
  const parsed = createVastspelenSeasonPeriodSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const seasonPeriod = await prisma.vastspelenSeasonPeriod.create({
    data: {
      naam: parsed.data.naam,
      seizoensdeel: parsed.data.seizoensdeel,
      start: new Date(parsed.data.start),
      eind: new Date(parsed.data.eind),
      totaalWedstrijden: parsed.data.totaalWedstrijden,
    },
  });

  return NextResponse.json({ seasonPeriod: toPublicSeasonPeriod(seasonPeriod) }, { status: 201 });
}
