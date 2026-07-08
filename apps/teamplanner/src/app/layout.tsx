import type { Metadata, Viewport } from "next";
import {
  AdminSettings,
  Footer,
  KorfbalToolBar,
  CookieConsent,
  GoogleAnalytics,
  ServiceWorkerRegister,
  InstallPrompt,
} from "@korfbaltools/ui";
import { getCurrentUser, getNavApps } from "@/lib/main-api";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teamindeling Tool",
  description: "Teamindeling voor Korfbaltools.nl",
};

export const viewport: Viewport = {
  themeColor: "#0E1C31",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, apps] = await Promise.all([getCurrentUser(), getNavApps()]);

  return (
    <html lang="nl">
      <body className="bg-white flex flex-col min-h-screen">
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        <KorfbalToolBar user={user} apps={apps} />
        <AdminSettings user={user} />
        <div className="pt-[60px]">{children}</div>
        <Footer />
        <CookieConsent />
        <InstallPrompt />
        <ServiceWorkerRegister swUrl="/teamplanner/sw.js" />
      </body>
    </html>
  );
}
