import type { Metadata } from "next";
import { Footer } from "@korfbaltools/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scoreformulier",
  description: "Live scoreverloop bijhouden tijdens een wedstrijd voor Korfbaltools.nl",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="bg-white flex flex-col min-h-screen">
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
