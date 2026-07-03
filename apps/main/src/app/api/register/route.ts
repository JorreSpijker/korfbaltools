import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@korfbaltools/types";
import { prisma } from "@korfbaltools/db";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { toPublicUser } from "@/lib/user-mapper";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { email, password, naam } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return errorResponse("conflict", "Er bestaat al een account met dit e-mailadres");
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, naam: naam ?? null },
  });

  await createSession(user.id);

  return NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
}
