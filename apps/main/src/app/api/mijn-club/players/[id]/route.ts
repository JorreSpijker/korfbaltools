import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { assignPlayerSchema } from "@korfbaltools/types";
import { requireClub } from "@/lib/club-context";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const result = requireClub("mijn-club");
  if ("response" in result) return result.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = assignPlayerSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const target = await prisma.player.findUnique({ where: { id } });
  if (!target || target.clubId !== result.clubId) {
    return errorResponse("not_found", "Speler niet gevonden");
  }

  if (parsed.data.teamId) {
    const team = await prisma.team.findUnique({ where: { id: parsed.data.teamId } });
    if (!team || team.clubId !== result.clubId) {
      return errorResponse("not_found", "Team niet gevonden");
    }
  }

  const player = await prisma.player.update({ where: { id }, data: { teamId: parsed.data.teamId } });
  return NextResponse.json({ player });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const result = requireClub("mijn-club");
  if ("response" in result) return result.response;

  const { id } = await params;
  const target = await prisma.player.findUnique({ where: { id } });
  if (!target || target.clubId !== result.clubId) {
    return errorResponse("not_found", "Speler niet gevonden");
  }

  await prisma.player.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
