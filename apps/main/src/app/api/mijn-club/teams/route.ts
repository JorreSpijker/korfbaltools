import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { createTeamSchema } from "@korfbaltools/types";
import { requireClubManager } from "@/lib/require-user";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

export async function GET() {
  const result = await requireClubManager();
  if ("response" in result) return result.response;
  if (result.scope.type !== "club") {
    return errorResponse("forbidden", "Alleen voor clubbeheerders");
  }

  const teams = await prisma.team.findMany({
    where: { clubId: result.scope.clubId },
    orderBy: { naam: "asc" },
  });

  return NextResponse.json({ teams });
}

export async function POST(request: NextRequest) {
  const result = await requireClubManager();
  if ("response" in result) return result.response;
  if (result.scope.type !== "club") {
    return errorResponse("forbidden", "Alleen voor clubbeheerders");
  }

  const body = await request.json().catch(() => null);
  const parsed = createTeamSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const team = await prisma.team.create({
    data: { ...parsed.data, clubId: result.scope.clubId },
  });

  return NextResponse.json({ team }, { status: 201 });
}
