import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@korfbaltools/types";
import { prisma } from "@korfbaltools/db";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { toPublicUser } from "@/lib/user-mapper";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  const passwordValid = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !passwordValid || user.deactivatedAt) {
    return errorResponse("unauthorized", "E-mailadres of wachtwoord onjuist");
  }

  await createSession(user.id);

  return NextResponse.json({ user: toPublicUser(user) });
}
