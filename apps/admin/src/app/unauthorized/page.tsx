import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-2 px-6 text-center">
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
        <ShieldAlert className="h-6 w-6 text-primary-700" />
      </div>
      <h1 className="text-2xl font-semibold text-neutral-900">Geen toegang</h1>
      <p className="text-neutral-600">Dit gedeelte is alleen beschikbaar voor beheerders.</p>
      <a className="text-primary-600 underline" href="https://korfbaltools.nl">
        Terug naar korfbaltools.nl
      </a>
    </main>
  );
}
