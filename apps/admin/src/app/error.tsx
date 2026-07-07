"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-2 px-6 text-center">
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
        <AlertTriangle className="h-6 w-6 text-danger" />
      </div>
      <h1 className="text-2xl font-semibold text-neutral-900">Er ging iets mis</h1>
      <p className="text-neutral-600">{error.message || "Onbekende fout. Probeer het opnieuw."}</p>
      <button
        onClick={reset}
        className="mt-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      >
        Opnieuw proberen
      </button>
    </main>
  );
}
