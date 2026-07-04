import { NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { CAPABILITIES } from "@korfbaltools/types";
import { requireAdmin } from "@/lib/require-user";

// Capitalized capability name as a sane default title until an admin sets a
// real one — see AppConfig.title in packages/db schema.prisma.
function defaultTitle(capability: string): string {
  return capability.charAt(0).toUpperCase() + capability.slice(1);
}

export async function GET() {
  const result = await requireAdmin();
  if ("response" in result) return result.response;

  // Lazily backfill a row for any capability that doesn't have one yet (e.g.
  // a capability added to the enum after this table was last read) so the
  // admin settings page always lists every app.
  await prisma.appConfig.createMany({
    data: CAPABILITIES.map((capability) => ({ capability, title: defaultTitle(capability) })),
    skipDuplicates: true,
  });

  const apps = await prisma.appConfig.findMany({ orderBy: { capability: "asc" } });

  return NextResponse.json({ apps });
}
