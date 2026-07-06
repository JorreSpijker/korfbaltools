import type { Metadata } from "next";
import { AdminSettings, KorfbalToolBar } from "@korfbaltools/ui";
import { getCurrentUser } from "@/lib/main-api";
import "./globals.css";

export const metadata: Metadata = {
  title: "Korfbaltools admin",
  description: "Gebruikersbeheer voor Korfbaltools.nl",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="nl">
      <body className="bg-neutral-50">
        <KorfbalToolBar user={user} />
        <AdminSettings user={user} />
        <div className="mt-10">
          {children}
        </div>
      </body>
    </html>
  );
}
