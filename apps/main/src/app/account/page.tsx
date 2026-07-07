import { redirect } from "next/navigation";
import { prisma } from "@korfbaltools/db";
import { getSessionUser } from "@/lib/session";
import { AccountForm } from "./account-form";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const clubs = await prisma.club.findMany({
    select: { id: true, naam: true },
    orderBy: { naam: "asc" },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-neutral-900">Mijn gegevens</h1>
        <p className="text-sm text-neutral-600">Beheer je naam, e-mailadres en clubkoppeling.</p>
      </div>
      <AccountForm clubs={clubs} user={user} />
    </main>
  );
}
