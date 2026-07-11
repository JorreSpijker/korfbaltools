import { Container } from "@korfbaltools/ui";
import { MatchStartForm } from "@/components/MatchStartForm";

export default function HomePage() {
  return (
    <main className="py-10">
      <Container>
        <h1 className="text-2xl font-semibold text-neutral-900">Scoreformulier</h1>
        <MatchStartForm />
      </Container>
    </main>
  );
}
