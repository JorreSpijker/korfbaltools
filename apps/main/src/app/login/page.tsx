"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { loginSchema, type LoginInput, type ApiErrorBody } from "@korfbaltools/types";

export default function LoginPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setFormError(null);
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const body = (await response.json()) as ApiErrorBody;
      setFormError(body.error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-neutral-900">Inloggen</h1>
        <p className="text-sm text-neutral-600">
          Log in met je e-mailadres en wachtwoord om verder te gaan naar je tools.
        </p>
      </div>

      <form className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-6" onSubmit={handleSubmit(onSubmit)}>
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
        {formError && <p className="text-sm text-danger">{formError}</p>}
        <button
          className="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
          disabled={isSubmitting}
          type="submit"
        >
          Inloggen
        </button>
      </form>

      <Link
        href="/register"
        className="flex items-center justify-center gap-1 text-sm text-neutral-600 hover:text-neutral-900"
      >
        Nog geen account? Registreren
        <ArrowRight className="h-4 w-4" />
      </Link>
    </main>
  );
}
