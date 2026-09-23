import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Multi-zone setup (apps/main rewrites /trainingen/* here) — without a
  // basePath, this app's /_next/static/* asset URLs collide with apps/main's.
  // https://nextjs.org/docs/app/guides/multi-zones
  basePath: "/trainingen",
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
  transpilePackages: ["@korfbaltools/config", "@korfbaltools/ui"],
  // De oefeningen worden als markdown van schijf gelezen (src/lib/content.ts).
  // /lijst is dynamisch door searchParams, dus dat gebeurt ook at runtime —
  // Vercel's file tracer ziet de content-map niet vanzelf.
  outputFileTracingIncludes: {
    "/**/*": ["./content/**/*"],
  },
};

export default nextConfig;
