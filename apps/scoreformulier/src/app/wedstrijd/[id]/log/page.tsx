import Link from "next/link";
import { Container } from "@korfbaltools/ui";
import { MatchLog } from "@/components/MatchLog";

export default async function WedstrijdLogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="py-10">
      <Container>
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900">Wedstrijdlog</h1>
          <Link href={`/wedstrijd/${id}`} className="text-primary hover:underline">
            Terug naar wedstrijd
          </Link>
        </div>
        <MatchLog wedstrijdId={id} />
      </Container>
    </main>
  );
}
