import type { Metadata, Viewport } from "next";
import {
  KorfbalToolBar,
  Footer,
  CookieConsent,
  GoogleAnalytics,
  ServiceWorkerRegister,
  InstallPrompt,
} from "@korfbaltools/ui";
import { getNavApps } from "@/lib/apps";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — tools voor korfbalclubs`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} — tools voor korfbalclubs`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — tools voor korfbalclubs`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: "#0E1C31",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="bg-tint flex flex-col min-h-screen">
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        <KorfbalToolBar apps={getNavApps()} />
        {children}
        <Footer />
        <CookieConsent />
        <InstallPrompt />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
