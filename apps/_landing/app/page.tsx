import Image from "next/image";
import SubscribeForm from "@/components/SubscribeForm";
import Faq from "@/components/Faq";

function CrossTick({
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span aria-hidden="true" className={`cross-tick ${className}`} {...rest} />
  );
}

const BENEFITS = [
  {
    title: "Vaovao",
    fr: "Actualités",
    body: "Ny zava-mitranga ao amin'ny paroasy, ny fanentanana ary ny fanambarana lehibe, mivantana amin'ny findaynao.",
  },
  {
    title: "Fandaharam-potoana",
    fr: "Horaires & calendrier",
    body: "Ora fanaovana lamesa, fotoam-piombonana ary fankalazana ara-pinoana, tsy hisy hadinoina intsony.",
  },
  {
    title: "Vondrona",
    fr: "Vie communautaire",
    body: "Hafatra avy amin'ny vondrona sy fikambanana ao anatin'ny paroasy: tanora, mpiandraikitra, mpivavaka.",
  },
  {
    title: "Fanentanana",
    fr: "Suivi des fidèles",
    body: "Ho voarakitra eo amin'ny KaRNet ny fizotry ny fiainam-pinoanao ao anatin'ny paroasy: sakramenta noraisina, fandraisana anjara amin'ny asa ary fifandraisana amin'ny pretra.",
  },
];

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logos/karnet-badge-burgundy.png"
              alt=""
              width={44}
              height={44}
              className="rounded-xl shadow-sm"
              priority
            />
            <div className="leading-tight">
              <p className="font-display text-lg font-bold text-burgundy">
                KaRNet
              </p>
              <p className="hidden md:inline text-xs text-ink/70">Rindrambaiko Pastoralin'ny EKAR</p>
            </div>
          </div>
          <a
            href="#misoratra"
            aria-label="Misoratra anarana"
            className="flex items-center justify-center gap-2 rounded-full border-2 border-burgundy p-2.5 text-sm font-semibold text-burgundy transition hover:bg-burgundy hover:text-cream md:px-4 md:py-2"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-5 w-5 md:hidden"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
              />
            </svg>
            <span className="hidden md:inline">Misoratra anarana</span>
          </a>
        </div>
      </header>

      <main id="main-content">
        {/* ---------------------------------------------------------- */}
        {/* Hero                                                       */}
        {/* ---------------------------------------------------------- */}
        <section
          id="misoratra"
          aria-labelledby="hero-heading"
          data-parallax-scope
          className="relative overflow-hidden bg-burgundy"
        >
          <div
            data-parallax-speed="0.2"
            className="bg-grain absolute -inset-y-16 inset-x-0 opacity-40"
          />
          <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-12 px-6 py-16 sm:py-24 lg:flex-row lg:items-center lg:py-28">
            <div className="order-2 max-w-xl animate-fade-up lg:order-1">
              <p className="inline-flex items-center gap-2 rounded-full bg-cream/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-bright">
                KaRNet
                <CrossTick className="h-3 text-gold-bright" />
                Rindrambaiko Pastoralin'ny EKAR
              </p>

              <h1
                id="hero-heading"
                lang="mg"
                className="mt-5 font-display text-4xl font-extrabold leading-[1.08] text-cream sm:text-5xl"
              >
                Ny rindrambaiko pastoralin&rsquo;ny EKAR
              </h1>
              <p className="mt-4 max-w-md text-base text-cream/75">
                Mpiomana handray sakramenta ?
                sa Te hanentana ny kristianina ? sa hangataka fihaonana amin&rsquo;ny pretra ?
                Misorata anarana mba hanarahanao ny fivoarany sy hisantaranao ny
                andrana ara-teknika.
              </p>

              <div className="mt-8">
                <SubscribeForm />
              </div>
            </div>

            <div
              className="order-1 flex w-full justify-center lg:order-2 lg:justify-end"
            >
              <div className="rounded-[2rem] bg-cream p-3 shadow-2xl shadow-black/30 sm:p-4">
                <Image
                  src="/logos/karnet-badge-cream.png"
                  alt="Marika KaRNet: ny litera K sy R mifandray amin'ny lakroa"
                  width={280}
                  height={280}
                  priority
                  className="h-auto mx-auto w-40 rounded-2xl sm:w-56"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* Benefits                                                    */}
        {/* ---------------------------------------------------------- */}
        <section aria-labelledby="benefits-heading" className="mx-auto max-w-6xl px-6 py-20">
          <h2
            id="benefits-heading"
            className="font-display text-2xl font-bold text-burgundy sm:text-3xl"
          >
            Ny ho azonao amin&rsquo;ny KaRNet
          </h2>
          <p className="mt-2 max-w-xl text-sm text-ink/70">
            L&rsquo;appli est en construction — cette page vous tient au
            courant de son avancement et vous invite aux beta-tests des
            premières fonctionnalités.
          </p>

          <ol className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((item, index) => (
              <li key={item.title} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="font-display text-sm font-bold text-burgundy"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <CrossTick className="h-4 text-ochre/60" />
                </div>
                <h3 className="font-display text-lg font-bold text-ink">
                  {item.title}
                </h3>
                <p className="text-xs uppercase tracking-wide text-ink/70">
                  {item.fr}
                </p>
                <p className="text-sm leading-relaxed text-ink/70">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <Faq />
      </main>

      <footer className="bg-burgundy-deep">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-14 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logos/karnet-badge-cream.png"
              alt=""
              width={36}
              height={36}
              className="rounded-lg"
            />
            <div>
              <p className="font-display text-base font-bold text-cream">
                KaRNet
              </p>
              <p className="text-xs text-cream/55">
                EKAR
              </p>
            </div>
          </div>

          <div className="text-xs leading-relaxed text-cream/55">
            <p>© {new Date().getFullYear()} EKAR. Zon&rsquo;ny mpanoratra voatokana.</p>
            <p className="mt-1">
              Fanontaniana? Mifandraisa amin&rsquo;ny paroasy amin&rsquo;ny
              fotoam-pivavahana.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
