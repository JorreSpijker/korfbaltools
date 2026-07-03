import { NextRequest, NextResponse } from "next/server";
import { confirmPasswordResetSchema } from "@korfbaltools/types";
import { prisma } from "@korfbaltools/db";
import { hashPassword } from "@/lib/password";
import { consumePasswordResetToken } from "@/lib/reset-token";
import { revokeAllSessionsForUser } from "@/lib/session";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = confirmPasswordResetSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const record = await consumePasswordResetToken(parsed.data.token);
  if (!record) {
    return errorResponse("unauthorized", "Reset-link is ongeldig of verlopen");
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash: await hashPassword(parsed.data.password) },
  });
  await revokeAllSessionsForUser(record.userId);

  return NextResponse.json({ ok: true });
}
