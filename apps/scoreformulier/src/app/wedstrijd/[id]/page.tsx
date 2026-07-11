import { Container } from "@korfbaltools/ui";
import { LiveMatchScreen } from "@/components/LiveMatchScreen";

export default async function WedstrijdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="py-10">
      <Container>
        <LiveMatchScreen wedstrijdId={id} />
      </Container>
    </main>
  );
}
