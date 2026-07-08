import type { Metadata } from "next";
import { Container } from "@korfbaltools/ui";

export const metadata: Metadata = {
  title: "Privacybeleid | Korfbaltools.nl",
  description: "Hoe Korfbaltools.nl omgaat met je gegevens.",
};

export default function PrivacyPage() {
  return (
    <main className="bg-neutral-50">
      <Container>
        <h1 className="text-2xl font-semibold text-neutral-900">Privacybeleid</h1>
        <p className="text-sm text-neutral-500">Laatst bijgewerkt: 8 juli 2026</p>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-neutral-900">Welke gegevens verzamelen we</h2>
          <p className="text-neutral-700">
            Als je een account aanmaakt slaan we je naam, e-mailadres en een gehasht wachtwoord op, samen met je
            koppeling aan een club en een sessie-cookie om je ingelogd te houden. Deze gegevens gebruiken we
            uitsluitend om Korfbaltools.nl te laten werken.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-neutral-900">Google Analytics</h2>
          <p className="text-neutral-700">
            We gebruiken Google Analytics om te meten hoe Korfbaltools.nl gebruikt wordt (bezochte pagina&apos;s,
            apparaattype, ongeveer waar bezoekers vandaan komen). IP-adressen worden geanonimiseerd. Deze cookies
            worden pas geplaatst nadat je hiervoor toestemming geeft via de cookiemelding. Je kunt je toestemming op
            elk moment intrekken door je browsercookies voor deze site te wissen.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-neutral-900">Delen met derden</h2>
          <p className="text-neutral-700">
            We verkopen je gegevens niet. Gegevens worden alleen gedeeld met partijen die nodig zijn om de dienst te
            laten draaien (zoals onze hosting- en database-leverancier en, als je toestemming geeft, Google
            Analytics).
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-neutral-900">Jouw rechten</h2>
          <p className="text-neutral-700">
            Je kunt je account en de bijbehorende gegevens op elk moment laten inzien, aanpassen of verwijderen door
            contact met ons op te nemen.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-neutral-900">Contact</h2>
          <p className="text-neutral-700">
            Vragen over dit privacybeleid? Neem contact op via {/* TODO: contactadres invullen */}
            <span className="font-medium">[contactadres nog toevoegen]</span>.
          </p>
        </section>
      </Container>
    </main>
  );
}
