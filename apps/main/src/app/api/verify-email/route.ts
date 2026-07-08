import { NextRequest, NextResponse } from "next/server";
import { verifyEmailSchema } from "@korfbaltools/types";
import { prisma } from "@korfbaltools/db";
import { consumeEmailVerificationToken } from "@/lib/verification-token";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = verifyEmailSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const record = await consumeEmailVerificationToken(parsed.data.token);
  if (!record) {
    return errorResponse("unauthorized", "Verificatielink is ongeldig of verlopen");
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerifiedAt: new Date() },
  });

  return NextResponse.json({ message: "E-mailadres bevestigd" });
}
