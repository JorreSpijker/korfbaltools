import type { Metadata, Viewport } from "next";
import {
  Footer,
  KorfbalToolBar,
  CookieConsent,
  GoogleAnalytics,
  ServiceWorkerRegister,
  InstallPrompt,
} from "@korfbaltools/ui";
import { getNavApps } from "@/lib/main-api";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teamindeling Tool",
  description: "Teamindeling voor Korfbaltools.nl",
};

export const viewport: Viewport = {
  themeColor: "#0E1C31",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const apps = await getNavApps();

  return (
    <html lang="nl">
      <body className="bg-white flex flex-col min-h-screen">
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        <KorfbalToolBar apps={apps} containerClassName="max-w-screen-2xl" />
        <div className="pt-[60px]">{children}</div>
        <Footer containerClassName="max-w-screen-2xl" />
        <CookieConsent />
        <InstallPrompt />
        <ServiceWorkerRegister swUrl="/teamindeling/sw.js" />
      </body>
    </html>
  );
}
