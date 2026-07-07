import Link from "next/link";
import {
  ArrowRight,
  LayoutGrid,
  Lock,
  Users,
  BarChart3,
  UserPlus,
  Link2,
  MousePointerClick,
  KeyRound,
  Layers,
  Route,
  Heart,
} from "lucide-react";
import { prisma } from "@korfbaltools/db";
import { CAPABILITIES, type Capability } from "@korfbaltools/types";
import { getSessionUser } from "@/lib/session";
import { APP_ROUTES, defaultTitle } from "@/lib/apps";
import { Container } from "@korfbaltools/ui";
import {
  DoorwayIllustration,
  OneAccountIllustration,
  TeamFormationIllustration,
  StatsIllustration,
} from "./_components/home-illustrations";

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

// Marketing copy per app — stays here since it's specific to this homepage
// grid, unlike route/title/visibility which come from lib/apps.ts.
const APP_DESCRIPTIONS: Partial<Record<Capability, string>> = {
  teamplanner: "Stel snel en eerlijk teamindelingen samen voor training en wedstrijden.",
  statistieken: "Wedstrijd- en spelerstatistieken overzichtelijk bijhouden.",
};

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
      <section className="border-b border-neutral-200 bg-white">
        <Container>
          <div className="grid w-full items-center gap-10 sm:grid-cols-2 sm:gap-16">
            <div className="flex flex-col items-start gap-4">
              <h1
                className="animate-fade-up text-balance text-4xl font-semibold text-primary-600 sm:text-5xl"
                style={{ animationDelay: "0ms" }}
              >
                Korfbaltools.nl
              </h1>
              <p
                className="animate-fade-up max-w-xl text-pretty text-lg text-neutral-600"
                style={{ animationDelay: "80ms" }}
              >
                Eén platform met losse tools voor korfbalteams — teamindeling, statistieken en meer. Eén account,
                eén login, en je bent bij de tool die je nodig hebt.
              </p>

              {user ? (
                <p className="animate-fade-up text-neutral-600" style={{ animationDelay: "140ms" }}>
                  Welkom terug, <strong>{user.naam ?? user.email}</strong>.
                </p>
              ) : (
                <div className="animate-fade-up flex items-center gap-4" style={{ animationDelay: "140ms" }}>
                  <Link
                    href="/register"
                    className="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
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

            <DoorwayIllustration className="animate-fade-up hidden w-full max-w-sm sm:block" />
          </div>
        </Container>
      </section>

      <section className="bg-white">
        <Container>
          <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold text-neutral-900">
            <LayoutGrid className="h-5 w-5 text-primary-600" />
            Apps
          </h2>
          <p className="mb-6 max-w-xl text-sm text-neutral-600">
            Je ziet hier alle tools van het platform. Welke je kunt openen hangt af van je rol en de club waar je
            aan gekoppeld bent — de rest staat vast klaar voor als je toegang krijgt.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {apps.map((app) => {
              const hasAccess = app.href !== null && (user?.capabilities.includes(app.capability) ?? true);
              const content = (
                <>
                  <div className="flex items-center gap-3">
                    {app.imageUrl ? (
                      <img src={app.imageUrl} alt="" className="h-10 w-10 rounded-md object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-primary-100" />
                    )}
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <span className="min-w-0 truncate font-medium text-neutral-900" title={app.title}>
                        {app.title}
                      </span>
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
                  className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5 transition hover:border-primary-300"
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
        </Container>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50">
        <Container>
          <div className="grid w-full items-center gap-10 sm:grid-cols-2 sm:gap-16">
            <div className="order-2 sm:order-1">
              <OneAccountIllustration className="w-full max-w-sm" />
            </div>
            <div className="order-1 flex flex-col items-start gap-4 sm:order-2">
              <h2 className="flex items-center gap-2 text-2xl font-semibold text-neutral-900 sm:text-3xl">
                <KeyRound className="h-6 w-6 text-primary-600" />
                Eén account, alle tools voor je club
              </h2>
              <p className="max-w-xl text-pretty text-neutral-600">
                Korfbaltools.nl bundelt losse tools voor korfbalclubs onder één login. Je maakt één keer een account,
                en gebruikt van daaruit elke tool die je club nodig heeft — zonder voor elke tool apart te
                registreren of in te loggen. Vandaag is dat Teamplanner; er komen tools bij zodra ze klaar zijn, en
                je bestaande account werkt daar automatisch ook voor.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white">
        <Container>
          <h2 className="mb-8 flex items-center gap-2 text-2xl font-semibold text-neutral-900 sm:text-3xl">
            <Layers className="h-6 w-6 text-primary-600" />
            Tools uitgelicht
          </h2>

          <div className="flex flex-col gap-6 rounded-lg border border-neutral-200 p-6 sm:flex-row sm:items-center sm:gap-10">
            <TeamFormationIllustration className="w-full shrink-0 sm:w-56" />
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary-700" />
                <h3 className="font-medium text-neutral-900">Teamplanner</h3>
              </div>
              <p className="text-sm text-neutral-600">
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

          <div className="mt-4 flex flex-col gap-6 rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-6 sm:flex-row sm:items-center sm:gap-10">
            <StatsIllustration className="w-full shrink-0 sm:w-56" />
            <div>
              <div className="mb-2 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-neutral-500" />
                <h3 className="font-medium text-neutral-900">Statistieken</h3>
                <span className="flex items-center gap-1 text-xs text-neutral-500">
                  <Lock className="h-3 w-3" />
                  Binnenkort
                </span>
              </div>
              <p className="text-sm text-neutral-600">
                Wedstrijd- en spelerstatistieken bijhouden — wie speelde wanneer, welke score, welke trend over het
                seizoen. Nog in ontwikkeling; geen datum, maar wel op de planning.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-neutral-200 bg-white">
        <Container>
          <h2 className="mb-8 flex items-center gap-2 text-2xl font-semibold text-neutral-900 sm:text-3xl">
            <Route className="h-6 w-6 text-primary-600" />
            Hoe het werkt
          </h2>

          <ol className="grid gap-6 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary-600">
                  <span className="text-sm font-semibold">{index + 1}</span>
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-neutral-900">{step.title}</h3>
                <p className="text-sm text-neutral-600">{step.description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-t border-neutral-200 bg-white">
        <Container>
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-neutral-900 sm:text-3xl">
            <Heart className="h-6 w-6 text-primary-600" />
            Gemaakt voor clubvrijwilligers
          </h2>
          <p className="max-w-xl text-pretty text-neutral-600">
            Korfbaltools.nl is gratis te gebruiken. Het is gemaakt voor coaches, secretarissen en andere
            vrijwilligers bij korfbalclubs — mensen die naast hun vrijwilligerswerk niet ook nog tijd willen
            steken in ingewikkelde software. Het platform is nog in een vroege fase: Teamplanner werkt vandaag,
            en nieuwe tools komen erbij zodra ze klaar zijn.
          </p>
          {!user && (
            <Link
              href="/register"
              className="mt-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
            >
              Account aanmaken
            </Link>
          )}
        </Container>
      </section>
    </main>
  );
}
