import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { updateProfileSchema } from "@korfbaltools/types";
import { requireUser } from "@/lib/require-user";
import { toPublicUser } from "@/lib/user-mapper";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

// Tool apps call this both client-side (same-origin via the rewrite, cookie
// sent automatically) and server-side (must forward the incoming Cookie
// header themselves — see docs/plan.md section 6).
export async function GET() {
  const result = await requireUser();
  if ("response" in result) return result.response;
  return NextResponse.json({ user: result.user });
}

export async function PATCH(request: NextRequest) {
  const result = await requireUser();
  if ("response" in result) return result.response;

  const body = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { email, naam, clubId } = parsed.data;

  if (email !== result.user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse("conflict", "Er bestaat al een account met dit e-mailadres");
    }
  }

  if (clubId) {
    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) {
      return errorResponse("not_found", "Club niet gevonden");
    }
  }

  const user = await prisma.user.update({
    where: { id: result.user.id },
    data: { email, naam: naam ?? null, ...(clubId !== undefined ? { clubId } : {}) },
  });

  return NextResponse.json({ user: toPublicUser(user) });
}
