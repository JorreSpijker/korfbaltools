export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-2xl font-semibold">Geen toegang</h1>
      <p className="text-neutral-600">Dit gedeelte is alleen beschikbaar voor beheerders.</p>
      <a className="text-brand-600 underline" href="https://korfbaltools.nl">
        Terug naar korfbaltools.nl
      </a>
    </main>
  );
}
