import type { Metadata } from "next";
import { Footer, KorfbalToolBar } from "@korfbaltools/ui";
import { getNavApps } from "@/lib/main-api";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scoreformulier",
  description: "Live scoreverloop bijhouden tijdens een wedstrijd voor Korfbaltools.nl",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const apps = await getNavApps();

  return (
    <html lang="nl">
      <body className="bg-white flex flex-col min-h-screen">
        <KorfbalToolBar apps={apps} />
        <div className="pt-[60px] flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
