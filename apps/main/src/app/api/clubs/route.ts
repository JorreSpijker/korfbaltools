import { NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { requireUser } from "@/lib/require-user";

// Any logged-in user can list clubs — needed for the self-service club
// picker on /account, not just the admin panel.
export async function GET() {
  const result = await requireUser();
  if ("response" in result) return result.response;

  const clubs = await prisma.club.findMany({
    select: { id: true, naam: true },
    orderBy: { naam: "asc" },
  });

  return NextResponse.json({ clubs });
}
