import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { createTeamSchema } from "@korfbaltools/types";
import { requireClub } from "@/lib/club-context";
import { validationErrorResponse } from "@/lib/api-response";

export async function GET() {
  const result = requireClub("mijn-club");
  if ("response" in result) return result.response;

  const teams = await prisma.team.findMany({
    where: { clubId: result.clubId },
    orderBy: { naam: "asc" },
  });

  return NextResponse.json({ teams });
}

export async function POST(request: NextRequest) {
  const result = requireClub("mijn-club");
  if ("response" in result) return result.response;

  const body = await request.json().catch(() => null);
  const parsed = createTeamSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const team = await prisma.team.create({
    data: { ...parsed.data, clubId: result.clubId },
  });

  return NextResponse.json({ team }, { status: 201 });
}
