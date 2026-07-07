import { NextResponse } from "next/server";
import { getNavApps } from "@/lib/apps";

// Public: same title/visibility info as the homepage "Apps" grid, just for
// apps/admin and apps/teamplanner to render the shared toolbar nav (see
// packages/ui KorfbalToolBar).
export async function GET() {
  const apps = await getNavApps();
  return NextResponse.json({ apps });
}
