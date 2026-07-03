import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@korfbaltools/db";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export async function createPasswordResetToken(userId: string) {
  const rawToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.passwordResetToken.create({
    data: { tokenHash: hashToken(rawToken), userId, expiresAt },
  });

  return { rawToken, expiresAt };
}

export async function consumePasswordResetToken(rawToken: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return null;
  }

  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return record;
}
