import { redirect } from "next/navigation";
import Link from "next/link";
import { Hammer } from "lucide-react";
import { prisma } from "@korfbaltools/db";

export default async function UnderConstructionPage() {
  const settings = await prisma.platformSettings.findUnique({ where: { id: "singleton" } });

  // Direct navigation here (e.g. a stale bookmark) once maintenance mode is
  // back off shouldn't show a dead page — send visitors to the real homepage.
  if (!settings?.maintenanceMode) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <Hammer className="h-8 w-8 text-brand-600" />
      <h1 className="text-2xl font-semibold text-neutral-900">Korfbaltools.nl wordt verbouwd</h1>
      <p className="text-neutral-600">
        We zijn bezig met onderhoud. Het platform is even niet beschikbaar — je kunt in de tussentijd al wel een
        account aanmaken.
      </p>
      <div className="mt-2 flex items-center gap-4">
        <Link
          href="/register"
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Account aanmaken
        </Link>
        <Link href="/login" className="text-sm text-neutral-600 hover:text-neutral-900">
          Inloggen
        </Link>
      </div>
    </main>
  );
}
