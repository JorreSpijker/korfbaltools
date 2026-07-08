import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@korfbaltools/types";
import { prisma } from "@korfbaltools/db";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { toPublicUser } from "@/lib/user-mapper";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  // Cheap IP check before any DB lookup/bcrypt — bcrypt is deliberately slow,
  // don't let a flood force it to run.
  const ipAllowed = await checkRateLimit(`login:ip:${getClientIp(request)}`, 20, 15 * 60 * 1000);
  if (!ipAllowed) {
    return errorResponse("rate_limited", "Te veel pogingen, probeer het later opnieuw");
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { email, password } = parsed.data;

  const emailAllowed = await checkRateLimit(`login:email:${email}`, 8, 15 * 60 * 1000);
  if (!emailAllowed) {
    return errorResponse("rate_limited", "Te veel pogingen, probeer het later opnieuw");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const passwordValid = user ? await verifyPassword(password, user.passwordHash) : false;

  // Must stay one generic message for both "no such user" and "wrong
  // password" — no user enumeration. The emailVerifiedAt check below only
  // runs once we already know the credentials were correct, for the same
  // reason: branching on verification status any earlier would let an
  // attacker distinguish a real-but-unverified email from a nonexistent one.
  if (!user || !passwordValid || user.deactivatedAt) {
    return errorResponse("unauthorized", "E-mailadres of wachtwoord onjuist");
  }

  if (!user.emailVerifiedAt) {
    return errorResponse("email_not_verified", "Bevestig eerst je e-mailadres voordat je kunt inloggen");
  }

  await createSession(user.id);

  return NextResponse.json({ user: toPublicUser(user) });
}
