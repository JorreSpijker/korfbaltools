import type { Metadata } from "next";
import { AdminSettings, Footer, KorfbalToolBar } from "@korfbaltools/ui";
import { getCurrentUser, getNavApps } from "@/lib/main-api";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teamindeling Tool",
  description: "Teamindeling voor Korfbaltools.nl",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, apps] = await Promise.all([getCurrentUser(), getNavApps()]);

  return (
    <html lang="nl">
      <body className="bg-white">
        <KorfbalToolBar user={user} apps={apps} />
        <AdminSettings user={user} />
        <div className="pt-[60px]">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
