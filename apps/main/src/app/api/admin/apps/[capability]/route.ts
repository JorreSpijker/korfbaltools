import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { CAPABILITIES, updateAppConfigSchema, type Capability } from "@korfbaltools/types";
import { requireAdmin } from "@/lib/require-user";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ capability: string }>;
}

function isCapability(value: string): value is Capability {
  return (CAPABILITIES as readonly string[]).includes(value);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const result = await requireAdmin();
  if ("response" in result) return result.response;

  const { capability } = await params;
  if (!isCapability(capability)) {
    return errorResponse("not_found", "Onbekende app");
  }

  const body = await request.json().catch(() => null);
  const parsed = updateAppConfigSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const previous = await prisma.appConfig.findUnique({ where: { capability } });

  const app = await prisma.$transaction(async (tx) => {
    const updated = await tx.appConfig.upsert({
      where: { capability },
      create: { capability, ...parsed.data },
      update: parsed.data,
    });
    await tx.auditLog.create({
      data: {
        actorId: result.user.id,
        action: "app_config_changed",
        metadata: {
          capability,
          previous: previous
            ? { title: previous.title, imageUrl: previous.imageUrl, visible: previous.visible }
            : null,
          next: parsed.data,
        },
      },
    });
    return updated;
  });

  return NextResponse.json({ app });
}
