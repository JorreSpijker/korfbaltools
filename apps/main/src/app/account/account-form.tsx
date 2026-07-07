"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, type UpdateProfileInput, type ApiErrorBody, type Club, type User } from "@korfbaltools/types";

interface AccountFormProps {
  user: User;
  clubs: Pick<Club, "id" | "naam">[];
}

export function AccountForm({ user, clubs }: AccountFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { naam: user.naam ?? "", email: user.email, clubId: user.clubId ?? "" },
  });

  async function onSubmit(data: UpdateProfileInput) {
    setFormError(null);
    setSaved(false);
    const response = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const body = (await response.json()) as ApiErrorBody;
      setFormError(body.error.message);
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-neutral-700" htmlFor="naam">
          Naam
        </label>
        <input
          className="w-full rounded-md border border-neutral-200 px-3 py-2"
          id="naam"
          {...register("naam")}
        />
        {errors.naam && <p className="text-sm text-danger">{errors.naam.message}</p>}
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
        <label className="text-sm text-neutral-700" htmlFor="clubId">
          Club
        </label>
        <select
          className="w-full rounded-md border border-neutral-200 px-3 py-2"
          id="clubId"
          {...register("clubId", { setValueAs: (value: string) => (value === "" ? null : value) })}
        >
          <option value="">Geen club</option>
          {clubs.map((club) => (
            <option key={club.id} value={club.id}>
              {club.naam}
            </option>
          ))}
        </select>
        {errors.clubId && <p className="text-sm text-danger">{errors.clubId.message}</p>}
      </div>
      {formError && <p className="text-sm text-danger">{formError}</p>}
      {saved && !formError && <p className="text-sm text-success">Opgeslagen</p>}
      <button
        className="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
        disabled={isSubmitting}
        type="submit"
      >
        Opslaan
      </button>
    </form>
  );
}
