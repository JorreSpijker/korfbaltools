import { ImageResponse } from "next/og";

const LOGO_PATH =
  "M195.501 175.5h-87.09L46.391 103V59.625L101.578.792h34.921L136.5.79H172L173.742 4v37.708h22.667v30.209H81.328l-8.25 8.187 64.624 73.843q-3.084-7.773-3.543-19.78v-52.5h39.583v51.291q.851 9.627 11.209 10.354l10.25.25 1.708 1.584.104 28.75zM134.034 19.613l-22.265 22.095h22.265zM40.911.792V175.5H.578V.792z";

export interface AppIconOptions {
  maskable?: boolean;
  background?: string;
}

export function appIconResponse(size: number, { maskable = false, background = "#0E1C31" }: AppIconOptions = {}) {
  const logoSize = size * (maskable ? 0.5 : 0.7);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background,
        }}
      >
        <svg width={logoSize} height={logoSize} viewBox="0 0 200 200">
          <path d={LOGO_PATH} fill="#f16018" />
        </svg>
      </div>
    ),
    { width: size, height: size }
  );
}
