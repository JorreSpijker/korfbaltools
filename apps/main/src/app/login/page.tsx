"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold">Inloggen</h1>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-sm" htmlFor="email">
            E-mailadres
          </label>
          <input className="w-full rounded-md border px-3 py-2" id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-sm text-danger">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm" htmlFor="password">
            Wachtwoord
          </label>
          <input
            className="w-full rounded-md border px-3 py-2"
            id="password"
            type="password"
            {...register("password")}
          />
          {errors.password && <p className="text-sm text-danger">{errors.password.message}</p>}
        </div>
        {formError && <p className="text-sm text-danger">{formError}</p>}
        <button className="rounded-md bg-brand-500 px-4 py-2 text-white disabled:opacity-50" disabled={isSubmitting} type="submit">
          Inloggen
        </button>
      </form>
    </main>
  );
}
