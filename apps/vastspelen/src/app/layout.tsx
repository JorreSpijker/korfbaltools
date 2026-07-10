import type { Metadata } from "next";
import { AdminSettings, Footer, KorfbalToolBar, CookieConsent, GoogleAnalytics } from "@korfbaltools/ui";
import { getCurrentUser, getNavApps } from "@/lib/main-api";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vastspelen Tool",
  description: "Voorkom vastspelen (KNKV A-categorie) voor Korfbaltools.nl",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, apps] = await Promise.all([getCurrentUser(), getNavApps()]);

  return (
    <html lang="nl">
      <body className="bg-white flex flex-col min-h-screen">
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        <KorfbalToolBar user={user} apps={apps} />
        <AdminSettings user={user} />
        <div className="pt-[60px] flex-1">{children}</div>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
