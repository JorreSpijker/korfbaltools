import { ImageResponse } from "next/og";
import { LOGO_ORANJE_OP_NAVY, LOGO_PATH } from "@korfbaltools/ui";
import { SITE_NAME } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE_NAME} — tools voor korfbalclubs`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 24,
          padding: 80,
          background: "#0E1C31",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <svg width={120} height={120} viewBox="0 0 200 200">
          <path d={LOGO_PATH} fill={LOGO_ORANJE_OP_NAVY} />
        </svg>
        <div style={{ fontSize: 76, fontWeight: 600, letterSpacing: -1 }}>{SITE_NAME}</div>
        <div style={{ fontSize: 36, color: "#cbd3de", maxWidth: 900 }}>
          Teamindeling, scoreformulier en vastspelen — gratis tools voor korfbalclubs.
        </div>
      </div>
    ),
    size,
  );
}
