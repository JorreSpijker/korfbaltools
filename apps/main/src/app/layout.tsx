import type { Metadata, Viewport } from "next";
import {
  AdminSettings,
  KorfbalToolBar,
  Footer,
  CookieConsent,
  GoogleAnalytics,
  ServiceWorkerRegister,
  InstallPrompt,
} from "@korfbaltools/ui";
import { getSessionUser } from "@/lib/session";
import { getNavApps } from "@/lib/apps";
import "./globals.css";

export const metadata: Metadata = {
  title: "Korfbaltools.nl",
  description: "Tools voor korfbalclubs",
};

export const viewport: Viewport = {
  themeColor: "#0E1C31",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  const apps = await getNavApps(user);

  return (
    <html lang="nl">
      <body className="bg-neutral-50 flex flex-col min-h-screen">
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        <KorfbalToolBar user={user} apps={apps} />
        <AdminSettings user={user} />
        {children}
        <Footer />
        <CookieConsent />
        <InstallPrompt />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
