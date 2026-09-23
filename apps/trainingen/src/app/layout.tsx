import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import {
  CookieConsent,
  Footer,
  GoogleAnalytics,
  InstallPrompt,
  KorfbalToolBar,
  ServiceWorkerRegister,
} from "@korfbaltools/ui";
import { getNavApps } from "@/lib/main-api";
import { TrainingProvider } from "@/lib/use-training";
import "./globals.css";

// Zelfgehost via next/font, zodat de PWA ook offline zijn eigen letter heeft.
const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trainingen",
  description: "Oefeningen zoeken en een training samenstellen voor Korfbaltools.nl",
  // Bewust niet indexeerbaar zolang de oefeningenbank nog groeit.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0E1C31",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const apps = await getNavApps();

  return (
    <html lang="nl" className={figtree.variable}>
      <body className="bg-page text-ink flex flex-col min-h-screen font-sans">
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        {/* Geen wrapper om de toolbar: die is zelf sticky, en een omhullende div
            wordt zijn containing block — dan scrollt hij alsnog weg. */}
        <KorfbalToolBar apps={apps} className="print-verbergen" containerClassName="max-w-screen-2xl" />
        <TrainingProvider>
          {/* De toolbar is sticky en positioneert zijn inhoud absoluut, dus hij
              neemt zelf nauwelijks hoogte in: die 60px compenseert dat. */}
          <div className="flex-1 pt-[60px] print:pt-0">{children}</div>
        </TrainingProvider>
        <div className="print-verbergen">
          <Footer containerClassName="max-w-screen-2xl" />
        </div>
        <CookieConsent />
        <InstallPrompt />
        <ServiceWorkerRegister swUrl="/trainingen/sw.js" />
      </body>
    </html>
  );
}
