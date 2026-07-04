import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { updatePlatformSettingsSchema } from "@korfbaltools/types";
import { requireAdmin } from "@/lib/require-user";
import { validationErrorResponse } from "@/lib/api-response";

const SETTINGS_ID = "singleton";

export async function GET() {
  const result = await requireAdmin();
  if ("response" in result) return result.response;

  const settings = await prisma.platformSettings.findUnique({ where: { id: SETTINGS_ID } });

  return NextResponse.json({ settings: { maintenanceMode: settings?.maintenanceMode ?? false } });
}

export async function PATCH(request: NextRequest) {
  const result = await requireAdmin();
  if ("response" in result) return result.response;

  const body = await request.json().catch(() => null);
  const parsed = updatePlatformSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const previous = await prisma.platformSettings.findUnique({ where: { id: SETTINGS_ID } });

  const settings = await prisma.$transaction(async (tx) => {
    const updated = await tx.platformSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...parsed.data },
      update: parsed.data,
    });
    await tx.auditLog.create({
      data: {
        actorId: result.user.id,
        action: "maintenance_mode_changed",
        metadata: {
          previousMaintenanceMode: previous?.maintenanceMode ?? false,
          nextMaintenanceMode: parsed.data.maintenanceMode,
        },
      },
    });
    return updated;
  });

  return NextResponse.json({ settings: { maintenanceMode: settings.maintenanceMode } });
}
