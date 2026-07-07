"use client";

import "./globals.css";

// Next.js requires this to render its own <html>/<body> — it replaces the
// root layout entirely, so it's the fallback for errors thrown by the
// layout itself (KorfbalToolBar, AdminSettings), not just page content.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="nl">
      <body className="bg-neutral-50">
        <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-2 px-6 text-center">
          <h1 className="text-2xl font-semibold text-neutral-900">Er ging iets mis</h1>
          <p className="text-neutral-600">{error.message || "Onbekende fout. Probeer het opnieuw."}</p>
          <button
            onClick={reset}
            className="mt-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
          >
            Opnieuw proberen
          </button>
        </main>
      </body>
    </html>
  );
}
