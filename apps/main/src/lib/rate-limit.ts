import "server-only";
import type { NextRequest } from "next/server";
import { prisma } from "@korfbaltools/db";

// Vercel sets x-forwarded-for; NextRequest.ip isn't reliably populated on
// every deployment target, so read the header directly instead.
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}

const CLEANUP_RETENTION_MS = 24 * 60 * 60 * 1000; // keep a day of buckets around
const CLEANUP_SAMPLE_RATE = 0.01;

// Fixed-window counter, Postgres-backed (see schema.prisma's RateLimitAttempt
// comment) instead of Redis/Upstash — no new external dependency, same
// philosophy as the DB-backed sessions already used here. Not exact-sliding,
// but good enough to blunt brute-force/spam at this traffic scale.
export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);

  const attempt = await prisma.rateLimitAttempt.upsert({
    where: { key_windowStart: { key, windowStart } },
    create: { key, windowStart, count: 1 },
    update: { count: { increment: 1 } },
  });

  if (Math.random() < CLEANUP_SAMPLE_RATE) {
    void prisma.rateLimitAttempt.deleteMany({
      where: { windowStart: { lt: new Date(Date.now() - CLEANUP_RETENTION_MS) } },
    });
  }

  return attempt.count <= limit;
}
