import { getSessionUser } from "@/lib/session";

export default async function HomePage() {
  const user = await getSessionUser();

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-start gap-2 px-6 py-16">
      <h1 className="text-3xl font-semibold text-brand-600">Korfbaltools.nl</h1>
      <p className="text-neutral-600">Tools voor korfbalteams — nog in opbouw.</p>
      {user && (
        <p className="text-neutral-600">
          Ingelogd als <strong>{user.email}</strong> ({user.role})
        </p>
      )}
    </main>
  );
}
