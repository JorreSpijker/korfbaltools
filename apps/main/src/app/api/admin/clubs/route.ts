import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { createClubSchema } from "@korfbaltools/types";
import { requireAdmin } from "@/lib/require-user";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

// Admin-only list, unlike the public /api/clubs — includes userCount so the
// admin UI can warn before a delete that would otherwise hit the FK
// constraint on User.clubId.
export async function GET() {
  const result = await requireAdmin();
  if ("response" in result) return result.response;

  const clubs = await prisma.club.findMany({
    select: { id: true, naam: true, _count: { select: { users: true } } },
    orderBy: { naam: "asc" },
  });

  return NextResponse.json({
    clubs: clubs.map((club) => ({ id: club.id, naam: club.naam, userCount: club._count.users })),
  });
}

export async function POST(request: NextRequest) {
  const result = await requireAdmin();
  if ("response" in result) return result.response;

  const body = await request.json().catch(() => null);
  const parsed = createClubSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const existing = await prisma.club.findFirst({ where: { naam: parsed.data.naam } });
  if (existing) {
    return errorResponse("conflict", "Er bestaat al een club met deze naam");
  }

  const club = await prisma.$transaction(async (tx) => {
    const created = await tx.club.create({ data: { naam: parsed.data.naam } });
    await tx.auditLog.create({
      data: { actorId: result.user.id, action: "club_created", metadata: { clubId: created.id, naam: created.naam } },
    });
    return created;
  });

  return NextResponse.json({ club: { id: club.id, naam: club.naam, userCount: 0 } }, { status: 201 });
}
