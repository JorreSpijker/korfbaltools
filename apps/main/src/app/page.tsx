import Link from "next/link";
import { ArrowRight, Lightbulb, Lock } from "lucide-react";
import { getEnabledApps } from "@/lib/apps";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { Container } from "@korfbaltools/ui";

// Welke tegels er staan hangt af van de APP_*_ENABLED-variabelen. Zonder deze
// regel wordt de pagina bij de build geprerenderd en blijft een gewijzigde
// vlag hangen tot de volgende build; met revalidate haalt hij de waarde
// hooguit een minuut later alsnog op.
export const revalidate = 60;

export default function HomePage() {
  const apps = getEnabledApps();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "nl-NL",
    hasPart: apps
      .filter((app) => app.href)
      .map((app) => ({
        "@type": "WebApplication",
        name: app.title,
        description: app.description,
        url: `${SITE_URL}${app.href}`,
        applicationCategory: "SportsApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: 0, priceCurrency: "EUR" },
      })),
  };

  return (
    <main className="flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="border-b border-line bg-white">
        <Container>
          <h1
            className="text-balance text-4xl font-semibold text-primary-600 sm:text-5xl"
            style={{ animationDelay: "0ms" }}
          >
            Korfbaltools.nl
          </h1>
          <p
            className="max-w-xl text-pretty text-lg text-muted"
            style={{ animationDelay: "80ms" }}
          >
            Handige hulpmiddeltjes voor vrijwilligers van korfbalclub. Voor nu alleen een hulpmiddel om een teamindeling te maken die je automatisch de bandbreedte berekend. Misschien komt er meer, misschien niet. 😉
          </p>
        </Container>
      </section>

      <Container>
        <h2 className="mb-6 text-2xl font-semibold text-primary-600 sm:text-3xl">Tools</h2>

        <div className="grid w-full gap-6 sm:grid-cols-2">
          {apps.map((app) => {
            const content = (
              <>
                <div className="aspect-video w-full overflow-hidden border-b border-line bg-primary-100">
                  {app.preview && (
                    <img src={app.preview} alt="" className="h-full w-full object-cover object-top" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xl font-semibold text-ink">{app.title}</h3>
                    {!app.href && (
                      <span className="flex shrink-0 items-center gap-1 text-xs text-muted">
                        <Lock className="h-3 w-3" />
                        Binnenkort
                      </span>
                    )}
                  </div>
                  <p className="text-muted">{app.description}</p>
                  {app.href && (
                    <span className="mt-auto flex items-center gap-1 pt-2 text-sm font-medium text-primary-600">
                      Openen
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </div>
              </>
            );

            const shared = "flex flex-col overflow-hidden rounded-lg border";

            return app.href ? (
              <Link
                key={app.key}
                href={app.href}
                className={`${shared} group border-line bg-white transition hover:border-primary-300`}
              >
                {content}
              </Link>
            ) : (
              <div key={app.key} className={`${shared} border-dashed border-line bg-tint`}>
                {content}
              </div>
            );
          })}

          <div className="flex flex-col overflow-hidden rounded-lg border border-dashed border-line bg-tint">
            <div className="flex aspect-video w-full items-center justify-center border-b border-dashed border-line">
              <Lightbulb className="h-10 w-10 text-outline" />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-6">
              <h3 className="text-xl font-semibold text-muted">Jouw idee?</h3>
              <p className="text-muted">
                Heb je een goed idee? Mooi. Stuur een mailtje naar <a href="mailto:jorre@outlook.com?subject=Idee%20voor%20Korfbaltools.nl" className="font-medium underline">jorre@outlook.com</a>.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
