import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { updateTeamSchema } from "@korfbaltools/types";
import { requireClubManager } from "@/lib/require-user";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const result = await requireClubManager();
  if ("response" in result) return result.response;
  if (result.scope.type !== "club") {
    return errorResponse("forbidden", "Alleen voor clubbeheerders");
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateTeamSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const target = await prisma.team.findUnique({ where: { id } });
  if (!target || target.clubId !== result.scope.clubId) {
    return errorResponse("not_found", "Team niet gevonden");
  }

  const team = await prisma.team.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ team });
}

// Spelers worden losgekoppeld (teamId -> null, zie Player.team onDelete: SetNull),
// niet verwijderd — ze gaan terug naar de pool.
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const result = await requireClubManager();
  if ("response" in result) return result.response;
  if (result.scope.type !== "club") {
    return errorResponse("forbidden", "Alleen voor clubbeheerders");
  }

  const { id } = await params;
  const target = await prisma.team.findUnique({ where: { id } });
  if (!target || target.clubId !== result.scope.clubId) {
    return errorResponse("not_found", "Team niet gevonden");
  }

  await prisma.team.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
