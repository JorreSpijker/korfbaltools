import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { assignPlayerSchema } from "@korfbaltools/types";
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
  const parsed = assignPlayerSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const target = await prisma.player.findUnique({ where: { id } });
  if (!target || target.clubId !== result.scope.clubId) {
    return errorResponse("not_found", "Speler niet gevonden");
  }

  if (parsed.data.teamId) {
    const team = await prisma.team.findUnique({ where: { id: parsed.data.teamId } });
    if (!team || team.clubId !== result.scope.clubId) {
      return errorResponse("not_found", "Team niet gevonden");
    }
  }

  const player = await prisma.player.update({ where: { id }, data: { teamId: parsed.data.teamId } });
  return NextResponse.json({ player });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const result = await requireClubManager();
  if ("response" in result) return result.response;
  if (result.scope.type !== "club") {
    return errorResponse("forbidden", "Alleen voor clubbeheerders");
  }

  const { id } = await params;
  const target = await prisma.player.findUnique({ where: { id } });
  if (!target || target.clubId !== result.scope.clubId) {
    return errorResponse("not_found", "Speler niet gevonden");
  }

  await prisma.player.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
