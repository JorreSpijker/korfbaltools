import { NextResponse } from "next/server";
import { getNavApps } from "@/lib/apps";

// Dezelfde lijst als de homepage "Apps"-grid, voor de gedeelde toolbar-nav in
// apps/teamindeling en apps/vastspelen (zie packages/ui KorfbalToolBar).
export function GET() {
  return NextResponse.json({ apps: getNavApps() });
}
