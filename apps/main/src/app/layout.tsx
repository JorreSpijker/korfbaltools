import type { Metadata } from "next";
import { AdminSettings, KorfbalToolBar, Footer} from "@korfbaltools/ui";
import { getSessionUser } from "@/lib/session";
import { getNavApps } from "@/lib/apps";
import "./globals.css";

export const metadata: Metadata = {
  title: "Korfbaltools.nl",
  description: "Tools voor korfbalclubs",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, apps] = await Promise.all([getSessionUser(), getNavApps()]);

  return (
    <html lang="nl">
      <body className="bg-neutral-50">
        <KorfbalToolBar user={user} apps={apps} />
        <AdminSettings user={user} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
