import type { Metadata } from "next";
import { AdminSettings, KorfbalToolBar } from "@korfbaltools/ui";
import { getCurrentUser } from "@/lib/main-api";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teamindeling Tool",
  description: "Teamindeling voor Korfbaltools.nl",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="nl">
      <body className="bg-white">
        <KorfbalToolBar user={user} />
        <AdminSettings user={user} />
        <div className="pt-[60px]">{children}</div>
      </body>
    </html>
  );
}
