"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { ApiErrorBody } from "@korfbaltools/types";

type Status = "pending" | "success" | "error";

function VerifyEmailStatus() {
  const token = useSearchParams().get("token") ?? "";
  const [status, setStatus] = useState<Status>("pending");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verificatielink is ongeldig.");
      return;
    }

    let cancelled = false;

    (async () => {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (cancelled) return;

      if (!response.ok) {
        const body = (await response.json()) as ApiErrorBody;
        setStatus("error");
        setMessage(body.error.message);
        return;
      }

      setStatus("success");
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (status === "pending") {
    return <p className="text-sm text-neutral-600">Bezig met bevestigen...</p>;
  }

  if (status === "error") {
    return <p className="text-sm text-danger">{message}</p>;
  }

  return <p className="text-sm text-neutral-700">Je e-mailadres is bevestigd. Je kunt nu inloggen.</p>;
}

export default function VerifyEmailPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold">E-mailadres bevestigen</h1>
      <Suspense>
        <VerifyEmailStatus />
      </Suspense>
      <Link href="/login" className="text-sm text-neutral-600 hover:text-neutral-900">
        Naar inloggen
      </Link>
    </main>
  );
}
