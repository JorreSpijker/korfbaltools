import Link from "next/link";
import { ArrowRight, LayoutGrid, Lock, Users, BarChart3, UserPlus, Link2, MousePointerClick } from "lucide-react";
import { prisma } from "@korfbaltools/db";
import { CAPABILITIES, type Capability } from "@korfbaltools/types";
import { getSessionUser } from "@/lib/session";

const STEPS = [
  {
    icon: UserPlus,
    title: "Account aanmaken",
    description: "Gratis, met alleen een e-mailadres en wachtwoord. Geen creditcard, geen proefperiode die afloopt.",
  },
  {
    icon: Link2,
    title: "Club koppelen",
    description: "Via je accountpagina koppel je jezelf aan je club. Kan ook later — je account werkt meteen.",
  },
  {
    icon: MousePointerClick,
    title: "Tool openen",
    description: "Kies de tool die je nodig hebt uit het overzicht hierboven. Geen apart account, geen nieuwe login.",
  },
];

// Structural per-app info (route + copy) — this stays in code because it's
// tied to the actual app deployment, unlike title/image/visibility which
// admins manage in apps/admin (AppConfig, see packages/db schema.prisma).
const APP_ROUTES: Partial<Record<Capability, string>> = {
  teamplanner: "/teamplanner",
};

const APP_DESCRIPTIONS: Partial<Record<Capability, string>> = {
  teamplanner: "Stel snel en eerlijk teamindelingen samen voor training en wedstrijden.",
  statistieken: "Wedstrijd- en spelerstatistieken overzichtelijk bijhouden.",
};

function defaultTitle(capability: Capability): string {
  return capability.charAt(0).toUpperCase() + capability.slice(1);
}

export default async function HomePage() {
  const [user, appConfigs] = await Promise.all([
    getSessionUser(),
    prisma.appConfig.findMany(),
  ]);

  const configByCapability = new Map(appConfigs.map((config) => [config.capability, config]));
  const apps = CAPABILITIES.map((capability) => {
    const config = configByCapability.get(capability);
    return {
      capability,
      title: config?.title ?? defaultTitle(capability),
      imageUrl: config?.imageUrl ?? null,
      visible: config?.visible ?? true,
      description: APP_DESCRIPTIONS[capability] ?? "",
      href: APP_ROUTES[capability] ?? null,
    };
  }).filter((app) => app.visible);

  return (
    <main className="flex flex-col">
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-4 px-6 py-20">
          <h1 className="text-4xl font-semibold text-brand-600 sm:text-5xl">Korfbaltools.nl</h1>
          <p className="max-w-xl text-lg text-neutral-600">
            Eén platform met losse tools voor korfbalteams — teamindeling, statistieken en meer.
          </p>

          {user ? (
            <p className="text-neutral-600">
              Welkom terug, <strong>{user.naam ?? user.email}</strong>.
            </p>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/register"
                className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Account aanmaken
              </Link>
              <Link href="/login" className="flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900">
                Inloggen
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-6 py-16">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-neutral-900">
          <LayoutGrid className="h-5 w-5 text-brand-600" />
          Apps
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {apps.map((app) => {
            const hasAccess = app.href !== null && (user?.capabilities.includes(app.capability) ?? true);
            const content = (
              <>
                <div className="flex items-center gap-3">
                  {app.imageUrl ? (
                    <img src={app.imageUrl} alt="" className="h-10 w-10 rounded-md object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-brand-100" />
                  )}
                  <div className="flex flex-1 items-center justify-between">
                    <span className="font-medium text-neutral-900">{app.title}</span>
                    {!hasAccess && (
                      <span className="flex items-center gap-1 text-xs text-neutral-500">
                        <Lock className="h-3 w-3" />
                        Binnenkort
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-neutral-600">{app.description}</p>
              </>
            );

            return hasAccess ? (
              <Link
                key={app.capability}
                href={app.href!}
                className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5 transition hover:border-brand-300"
              >
                {content}
              </Link>
            ) : (
              <div
                key={app.capability}
                className="flex flex-col gap-2 rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-5"
              >
                {content}
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">
            Één account, alle tools voor je club
          </h2>
          <p className="mt-4 max-w-xl text-neutral-600">
            Korfbaltools.nl bundelt losse tools voor korfbalclubs onder één login. Je maakt één keer een account,
            en gebruikt van daaruit elke tool die je club nodig heeft — zonder voor elke tool apart te registreren
            of in te loggen. Vandaag is dat Teamplanner; er komen tools bij zodra ze klaar zijn, en je bestaande
            account werkt daar automatisch ook voor.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">Tools uitgelicht</h2>

          <div className="mt-8 flex flex-col gap-4 rounded-lg border border-neutral-200 p-6 sm:flex-row sm:gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-brand-100">
              <Users className="h-6 w-6 text-brand-700" />
            </div>
            <div>
              <h3 className="font-medium text-neutral-900">Teamplanner</h3>
              <p className="mt-1 text-sm text-neutral-600">
                Stel teamindelingen samen voor training en wedstrijden, zonder gedoe met spreadsheets.
              </p>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-neutral-600">
                <li>Spelerslijst importeren</li>
                <li>Teams indelen per categorie, met drag-and-drop</li>
                <li>Automatische controle tegen de Competitie 2.0-regels</li>
                <li>Eindresultaat exporteren, klaar voor inschrijving</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-neutral-100">
              <BarChart3 className="h-6 w-6 text-neutral-500" />
            </div>
            <div>
              <h3 className="font-medium text-neutral-900">Statistieken</h3>
              <p className="mt-1 text-sm text-neutral-600">
                Wedstrijd- en spelerstatistieken bijhouden. Nog in ontwikkeling.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">Hoe het werkt</h2>

          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-brand-600">
                  <span className="text-sm font-semibold">{index + 1}</span>
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-neutral-900">{step.title}</h3>
                <p className="text-sm text-neutral-600">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-neutral-200">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-4 px-6 py-16">
          <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">Gemaakt voor clubvrijwilligers</h2>
          <p className="max-w-xl text-neutral-600">
            Korfbaltools.nl is gratis te gebruiken. Het is gemaakt voor coaches, secretarissen en andere
            vrijwilligers bij korfbalclubs — mensen die naast hun vrijwilligerswerk niet ook nog tijd willen
            steken in ingewikkelde software. Het platform is nog in een vroege fase: Teamplanner werkt vandaag,
            en nieuwe tools komen erbij zodra ze klaar zijn.
          </p>
          {!user && (
            <Link
              href="/register"
              className="mt-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Account aanmaken
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
