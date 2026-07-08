import { appIconResponse } from "@korfbaltools/ui";

export function GET() {
  return appIconResponse(512, { maskable: true });
}
