import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-2 px-6 text-center">
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
        <SearchX className="h-6 w-6 text-primary-700" />
      </div>
      <h1 className="text-2xl font-semibold text-neutral-900">Niet gevonden</h1>
      <p className="text-neutral-600">Deze pagina of gebruiker bestaat niet (meer).</p>
      <Link
        className="rounded-sm text-primary-600 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        href="/"
      >
        Terug naar gebruikersbeheer
      </Link>
    </main>
  );
}
