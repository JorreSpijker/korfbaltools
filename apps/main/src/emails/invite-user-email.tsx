import { Body, Container, Head, Heading, Html, Link, Preview, Text } from "@react-email/components";

interface InviteUserEmailProps {
  setPasswordUrl: string;
}

export function InviteUserEmail({ setPasswordUrl }: InviteUserEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Je bent uitgenodigd voor Korfbaltools.nl</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#fafafa" }}>
        <Container style={{ padding: "24px" }}>
          <Heading as="h2">Welkom bij Korfbaltools.nl</Heading>
          <Text>
            Er is een account voor je aangemaakt op Korfbaltools.nl. Klik op onderstaande link om een
            wachtwoord in te stellen en in te loggen. Deze link is 1 uur geldig.
          </Text>
          <Link href={setPasswordUrl}>{setPasswordUrl}</Link>
          <Text style={{ color: "#737373", fontSize: "12px", marginTop: "24px" }}>
            Verwachtte je deze e-mail niet? Dan kun je hem negeren.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
