import type { Metadata } from "next";
import { Container } from "@korfbaltools/ui";

export const metadata: Metadata = {
  title: "Privacybeleid",
  description: "Hoe Korfbaltools.nl omgaat met je gegevens.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="bg-tint">
      <Container>
        <h1 className="text-2xl font-semibold text-ink">Privacybeleid</h1>
        <p className="text-sm text-muted">Laatst bijgewerkt: 9 september 2026</p>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-ink">Geen account nodig</h2>
          <p className="text-muted">
            Korfbaltools.nl werkt zonder account. Je hoeft niet in te loggen en we vragen geen naam, e-mailadres of
            wachtwoord van je.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-ink">Gegevens die je zelf invoert</h2>
          <p className="text-muted">
            De Teamindeling-tool bewaart wat je invult alleen in je eigen browser (localStorage). Die gegevens komen
            niet op onze servers terecht en verdwijnen als je je browsergegevens wist.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-ink">Cookies</h2>
          <p className="text-muted">
            We plaatsen één cookie om te onthouden welke keuze je in de cookiemelding hebt gemaakt. Verder gebruiken
            we geen functionele cookies, omdat er geen inlog is.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-ink">Google Analytics</h2>
          <p className="text-muted">
            We gebruiken Google Analytics om te meten hoe Korfbaltools.nl gebruikt wordt (bezochte pagina&apos;s,
            apparaattype, ongeveer waar bezoekers vandaan komen). IP-adressen worden geanonimiseerd. Deze cookies
            worden pas geplaatst nadat je hiervoor toestemming geeft via de cookiemelding. Je kunt je toestemming op
            elk moment intrekken door je browsercookies voor deze site te wissen.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-ink">Delen met derden</h2>
          <p className="text-muted">
            We verkopen je gegevens niet. Gegevens worden alleen gedeeld met partijen die nodig zijn om de dienst te
            laten draaien (zoals onze hosting- en database-leverancier en, als je toestemming geeft, Google
            Analytics).
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-ink">Jouw rechten</h2>
          <p className="text-muted">
            Wil je weten welke gegevens van je club bij ons staan, of wil je ze laten aanpassen of verwijderen? Neem
            contact met ons op, dan regelen we dat.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-ink">Contact</h2>
          <p className="text-muted">
            Vragen over dit privacybeleid? Neem contact op via 
             <a href="mailto:jorre@outlook.com" className="font-medium underline ml-1">jorre@outlook.com</a>.
          </p>
        </section>
      </Container>
    </main>
  );
}
