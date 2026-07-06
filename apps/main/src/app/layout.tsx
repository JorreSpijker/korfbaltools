import type { Metadata } from "next";
import { AdminSettings, KorfbalToolBar } from "@korfbaltools/ui";
import { getSessionUser } from "@/lib/session";
import "./globals.css";

export const metadata: Metadata = {
  title: "Korfbaltools.nl",
  description: "Tools voor korfbalclubs",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  return (
    <html lang="nl">
      <body>
        <KorfbalToolBar user={user} />
        <AdminSettings user={user} />
        {children}
      </body>
    </html>
  );
}
