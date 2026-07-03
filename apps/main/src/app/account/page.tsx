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
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold">Mijn gegevens</h1>
      <AccountForm clubs={clubs} user={user} />
    </main>
  );
}
