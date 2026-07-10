import { NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { requireUser } from "@/lib/require-user";
import { toPublicUser } from "@/lib/user-mapper";

// User-initiated cancel of their own pending join-request — no admin action
// was taken, so no audit entry (nothing was ever approved to undo).
export async function DELETE() {
  const result = await requireUser();
  if ("response" in result) return result.response;

  const user = await prisma.user.update({
    where: { id: result.user.id },
    data: { pendingClubId: null },
  });

  return NextResponse.json({ user: toPublicUser(user) });
}
