import { NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";

const SETTINGS_ID = "singleton";

// Public and unauthenticated on purpose: apps/main's middleware calls this
// on nearly every request (edge runtime, can't touch Prisma directly — same
// reasoning as the /api/me call it already makes) to decide whether to
// rewrite to /under-construction. maintenanceMode is not sensitive.
export async function GET() {
  const settings = await prisma.platformSettings.findUnique({ where: { id: SETTINGS_ID } });

  return NextResponse.json({ maintenanceMode: settings?.maintenanceMode ?? false });
}
