"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { registerSchema, type RegisterInput, type ApiErrorBody } from "@korfbaltools/types";

export default function RegisterPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterInput) {
    setFormError(null);
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const body = (await response.json()) as ApiErrorBody;
      setFormError(body.error.message);
      return;
    }

    // No auto-login anymore — login is blocked until the address is
    // verified, so show a "check your email" screen instead of redirecting.
    setDone(true);
  }

  if (done) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-6 py-12 text-center">
        <h1 className="text-xl font-semibold text-neutral-900">Bijna klaar</h1>
        <p className="text-sm text-neutral-600">
          We hebben een e-mail gestuurd om je e-mailadres te bevestigen. Klik op de link in die e-mail om in te
          loggen.
        </p>
        <Link href="/login" className="flex items-center justify-center gap-1 text-sm text-neutral-600 hover:text-neutral-900">
          Naar inloggen
          <ArrowRight className="h-4 w-4" />
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-neutral-900">Account aanmaken</h1>
        <p className="text-sm text-neutral-600">
          Eén account geeft toegang tot alle tools op het platform — vandaag Teamindeling, en meer zodra ze klaar
          zijn. Gratis, alleen een e-mailadres en wachtwoord nodig. Je koppelt je club later vanaf je
          accountpagina.
        </p>
      </div>

      <form className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-700" htmlFor="naam">
            Naam (optioneel)
          </label>
          <input
            className="w-full rounded-md border border-neutral-200 px-3 py-2"
            id="naam"
            {...register("naam")}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-700" htmlFor="email">
            E-mailadres
          </label>
          <input
            className="w-full rounded-md border border-neutral-200 px-3 py-2"
            id="email"
            type="email"
            {...register("email")}
          />
          {errors.email && <p className="text-sm text-danger">{errors.email.message}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-700" htmlFor="password">
            Wachtwoord
          </label>
          <input
            className="w-full rounded-md border border-neutral-200 px-3 py-2"
            id="password"
            type="password"
            {...register("password")}
          />
          {errors.password && <p className="text-sm text-danger">{errors.password.message}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-700" htmlFor="confirmPassword">
            Wachtwoord bevestigen
          </label>
          <input
            className="w-full rounded-md border border-neutral-200 px-3 py-2"
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && <p className="text-sm text-danger">{errors.confirmPassword.message}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-2 text-sm text-neutral-700" htmlFor="avgConsent">
            <input className="mt-0.5" id="avgConsent" type="checkbox" {...register("avgConsent")} />
            <span>
              Ik ga akkoord met het{" "}
              <Link href="/privacy" className="underline hover:text-neutral-900">
                privacybeleid
              </Link>
            </span>
          </label>
          {errors.avgConsent && <p className="text-sm text-danger">{errors.avgConsent.message}</p>}
        </div>
        {formError && <p className="text-sm text-danger">{formError}</p>}
        <button
          className="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
          disabled={isSubmitting}
          type="submit"
        >
          Account aanmaken
        </button>
      </form>

      <Link
        href="/login"
        className="flex items-center justify-center gap-1 text-sm text-neutral-600 hover:text-neutral-900"
      >
        Heb je al een account? Inloggen
        <ArrowRight className="h-4 w-4" />
      </Link>
    </main>
  );
}
