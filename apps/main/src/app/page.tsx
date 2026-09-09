import Link from "next/link";
import { ArrowRight, Lightbulb, Lock } from "lucide-react";
import { getEnabledApps } from "@/lib/apps";
import { Container } from "@korfbaltools/ui";

export default function HomePage() {
  const apps = getEnabledApps();

  return (
    <main className="flex flex-col">
      <section className="border-b border-neutral-200 bg-white">
        <Container>
          <h1
            className="text-balance text-4xl font-semibold text-primary-600 sm:text-5xl"
            style={{ animationDelay: "0ms" }}
          >
            Korfbaltools.nl
          </h1>
          <p
            className="max-w-xl text-pretty text-lg text-neutral-600"
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
                <div className="aspect-video w-full overflow-hidden border-b border-neutral-200 bg-primary-100">
                  {app.preview && (
                    <img src={app.preview} alt="" className="h-full w-full object-cover object-top" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xl font-semibold text-neutral-900">{app.title}</h3>
                    {!app.href && (
                      <span className="flex shrink-0 items-center gap-1 text-xs text-neutral-500">
                        <Lock className="h-3 w-3" />
                        Binnenkort
                      </span>
                    )}
                  </div>
                  <p className="text-neutral-600">{app.description}</p>
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
                className={`${shared} group border-neutral-200 bg-white transition hover:border-primary-300`}
              >
                {content}
              </Link>
            ) : (
              <div key={app.key} className={`${shared} border-dashed border-neutral-200 bg-neutral-50`}>
                {content}
              </div>
            );
          })}

          <div className="flex flex-col overflow-hidden rounded-lg border border-dashed border-neutral-200 bg-neutral-50">
            <div className="flex aspect-video w-full items-center justify-center border-b border-dashed border-neutral-200">
              <Lightbulb className="h-10 w-10 text-neutral-400" />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-6">
              <h3 className="text-xl font-semibold text-neutral-500">Jouw idee?</h3>
              <p className="text-neutral-500">
                Heb je een goed idee? Mooi. Stuur een mailtje naar <a href="mailto:jorre@outlook.com?subject=Idee%20voor%20Korfbaltools.nl" className="font-medium underline">jorre@outlook.com</a>.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
