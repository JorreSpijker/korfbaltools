"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { confirmPasswordResetSchema, type ConfirmPasswordResetInput, type ApiErrorBody } from "@korfbaltools/types";

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConfirmPasswordResetInput>({
    resolver: zodResolver(confirmPasswordResetSchema),
    defaultValues: { token },
  });

  async function onSubmit(data: ConfirmPasswordResetInput) {
    setFormError(null);
    const response = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const body = (await response.json()) as ApiErrorBody;
      setFormError(body.error.message);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  if (done) {
    return <p>Wachtwoord gewijzigd, je wordt doorgestuurd naar de inlogpagina.</p>;
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" {...register("token")} />
      <div>
        <label className="block text-sm" htmlFor="password">
          Nieuw wachtwoord
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
      <button className="rounded-md bg-primary-500 px-4 py-2 text-white disabled:opacity-50" disabled={isSubmitting} type="submit">
        Wachtwoord instellen
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold">Nieuw wachtwoord instellen</h1>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
