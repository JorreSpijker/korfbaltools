import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@korfbaltools/db";
import type { User } from "@korfbaltools/types";
import { toPublicUser } from "./user-mapper";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, sessionCookieOptions } from "./session-cookie";

// Raw token goes in the cookie; only its hash is stored, so a DB read/leak
// can't be replayed as a valid session cookie.
function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export async function createSession(userId: string) {
  const rawToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await prisma.session.create({
    data: { sessionToken: hashToken(rawToken), userId, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, sessionCookieOptions(expiresAt));

  return { rawToken, expiresAt };
}

export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (rawToken) {
    await prisma.session.deleteMany({ where: { sessionToken: hashToken(rawToken) } });
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Called when an admin changes a user's role or deactivates them, so the
// change takes effect immediately instead of waiting for token expiry.
export async function revokeAllSessionsForUser(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!rawToken) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken: hashToken(rawToken) },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || session.user.deactivatedAt) {
    return null;
  }

  return toPublicUser(session.user);
}
