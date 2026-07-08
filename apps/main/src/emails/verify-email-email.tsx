import { Body, Container, Head, Heading, Html, Link, Preview, Text } from "@react-email/components";

interface VerifyEmailEmailProps {
  verifyUrl: string;
}

export function VerifyEmailEmail({ verifyUrl }: VerifyEmailEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bevestig je e-mailadres voor Korfbaltools.nl</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#fafafa" }}>
        <Container style={{ padding: "24px" }}>
          <Heading as="h2">Bevestig je e-mailadres</Heading>
          <Text>
            Bedankt voor je registratie bij Korfbaltools.nl. Klik op onderstaande link om je e-mailadres te
            bevestigen en in te loggen. Deze link is 24 uur geldig.
          </Text>
          <Link href={verifyUrl}>{verifyUrl}</Link>
          <Text style={{ color: "#737373", fontSize: "12px", marginTop: "24px" }}>
            Heb je hier geen account voor aangemaakt? Dan kun je deze e-mail negeren.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
