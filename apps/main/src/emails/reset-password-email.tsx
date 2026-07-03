import { Body, Container, Head, Heading, Html, Link, Preview, Text } from "@react-email/components";

interface ResetPasswordEmailProps {
  resetUrl: string;
}

export function ResetPasswordEmail({ resetUrl }: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Wachtwoord resetten voor Korfbaltools.nl</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#fafafa" }}>
        <Container style={{ padding: "24px" }}>
          <Heading as="h2">Wachtwoord resetten</Heading>
          <Text>
            Er is een wachtwoordreset aangevraagd voor jouw account op Korfbaltools.nl. Klik op
            onderstaande link om een nieuw wachtwoord in te stellen. Deze link is 1 uur geldig.
          </Text>
          <Link href={resetUrl}>{resetUrl}</Link>
          <Text style={{ color: "#737373", fontSize: "12px", marginTop: "24px" }}>
            Heb je dit niet aangevraagd? Dan kun je deze e-mail negeren.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
