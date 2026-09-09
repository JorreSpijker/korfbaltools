import type { MetadataRoute } from "next";
import { getEnabledApps } from "@/lib/apps";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // Alleen ingeschakelde tools met een echte route: de rest wordt door de
  // middleware naar een 404 gestuurd (zie lib/apps.ts en middleware.ts).
  const tools = getEnabledApps()
    .filter((app) => app.href && app.key !== "mijn-club")
    .map((app) => ({
      url: `${SITE_URL}${app.href}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  return [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    ...tools,
    { url: `${SITE_URL}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
