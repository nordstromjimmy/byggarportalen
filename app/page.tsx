// src/app/page.tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#334155_0,_#020617_55%,_#020617_100%)]" />

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-6 md:px-6 md:pt-8">
        {/* Navbar */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-400/40 bg-sky-500/10 text-sm font-semibold text-sky-300 shadow-sm shadow-sky-500/30">
              BP
            </div>
            <div>
              <a href="/">
                {" "}
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
                  Byggarportalen
                </div>
                <p className="text-xs text-slate-400">
                  Projektportal för hantverkare
                </p>
              </a>
            </div>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-slate-100">
              Funktioner
            </a>
            <a href="#how-it-works" className="hover:text-slate-100">
              Så funkar det
            </a>
            <a href="#who-for" className="hover:text-slate-100">
              För vem?
            </a>
            <a
              href="/login"
              className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-1.5 text-sm font-medium text-slate-100 shadow-sm hover:border-slate-500 hover:bg-slate-900"
            >
              Logga in
            </a>
          </nav>

          {/* Mobile log in button */}
          <a
            href="/login"
            className="md:hidden rounded-full border border-slate-700 bg-slate-900/70 px-4 py-1.5 text-sm font-medium text-slate-100 shadow-sm hover:border-slate-500 hover:bg-slate-900"
          >
            Logga in
          </a>
        </header>

        {/* Hero */}
        <section className="mt-12 grid flex-1 grid-cols-1 items-center gap-12 md:mt-16 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          {/* Left side: text */}
          <div>
            <div className="inline-flex rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-200">
              För mindre bygg- och hantverksföretag i Sverige
            </div>

            <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
              All info om ditt byggprojekt{" "}
              <span className="text-sky-300">på ett ställe</span>.
            </h1>

            <p className="mt-4 max-w-xl text-sm text-slate-300 sm:text-base">
              Byggarportalen samlar tidsplan, kontaktuppgifter och chatt för
              varje projekt. Mindre strul mellan yrkesgrupper – mer tid för
              själva jobbet.
            </p>

            {/* Tiny trust section */}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div>
                <div className="font-semibold text-slate-200">
                  Mindre missförstånd
                </div>
                <p>All kommunikation kopplad till respektive projekt.</p>
              </div>
              <div>
                <div className="font-semibold text-slate-200">
                  Snabb överblick
                </div>
                <p>Tydlig vecka-för-vecka-plan för alla yrkesgrupper.</p>
              </div>
            </div>
          </div>

          {/* Right side: mock UI card */}
          <div className="relative">
            <div className="absolute -right-6 -top-6 hidden h-24 w-24 rounded-full border border-sky-500/40 bg-sky-500/10 blur-2xl md:block" />

            <div className="relative rounded-2xl border border-slate-700/80 bg-slate-900/80 p-4 shadow-2xl shadow-black/60 backdrop-blur">
              <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div>
                  <p className="text-xs font-medium text-slate-300">
                    Projekt • Kontorsombyggnad plan 3
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Start v.12 · Slut v.15 · Stockholm
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                  Pågår
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 text-xs text-slate-200">
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Tidsplan (vecka)
                  </p>
                  <ul className="space-y-1.5">
                    <li className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">v.12</span>
                      <span>Rivning</span>
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-300">
                        Snickare
                      </span>
                    </li>
                    <li className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">v.13</span>
                      <span>Ventinstallation</span>
                      <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] text-sky-300">
                        Ventilation
                      </span>
                    </li>
                    <li className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">v.14</span>
                      <span>Slutmontage el</span>
                      <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[11px] text-violet-300">
                        Elektriker
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Chatt
                  </p>
                  <div className="space-y-1.5 text-[11px]">
                    <p>
                      <span className="font-semibold text-slate-100">
                        Snickare:
                      </span>{" "}
                      Vi blir klara med rivningen redan torsdag.
                    </p>
                    <p>
                      <span className="font-semibold text-slate-100">
                        Ventilation:
                      </span>{" "}
                      Toppen, då kan vi gå in v.13 måndag morgon.
                    </p>
                    <p>
                      <span className="font-semibold text-slate-100">
                        Elektriker:
                      </span>{" "}
                      Uppdaterar slutmontage till v.14.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3 text-[11px] text-slate-400">
                <span>3 yrkesgrupper · 8 deltagare</span>
                <span>Allt samlat i Byggarportalen</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature section */}
        <section
          id="features"
          className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3"
        >
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <h2 className="text-sm font-semibold text-slate-100">
              Enkel tidsplan
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Planera arbetet vecka för vecka med ansvarig yrkesgrupp. Alla ser
              direkt när det är deras tur att gå in.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <h2 className="text-sm font-semibold text-slate-100">
              All info per projekt
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Adress, kund, kontaktpersoner och viktiga anteckningar – samlat
              per projekt istället för utspritt i sms och Excel.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <h2 className="text-sm font-semibold text-slate-100">
              Chatt mellan yrkesgrupper
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              En chatt per projekt där snickare, ventilation, elektriker m.fl.
              kan ställa frågor och lösa detaljer snabbt.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="mt-14 border-t border-slate-800 pt-10 md:mt-20"
        >
          <h2 className="text-lg font-semibold text-slate-50">
            Så funkar Byggarportalen
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-300">
            Byggd för mindre projekt där 2–5 yrkesgrupper behöver hålla koll på
            samma plan – utan att drunkna i avancerade system.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="mb-2 text-xs font-semibold text-sky-300">
                Steg 1
              </div>
              <h3 className="text-sm font-semibold text-slate-100">
                Skapa projektet
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Lägg in projektets namn, adress, kund och ungefärligt start- och
                slutdatum.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="mb-2 text-xs font-semibold text-sky-300">
                Steg 2
              </div>
              <h3 className="text-sm font-semibold text-slate-100">
                Lägg upp tidsplan & bjud in
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Skapa en enkel vecka-för-vecka-plan och bjud in snickare,
                ventilation, elektriker m.fl. till projektet.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="mb-2 text-xs font-semibold text-sky-300">
                Steg 3
              </div>
              <h3 className="text-sm font-semibold text-slate-100">
                Kommunicera på rätt ställe
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Använd projektchatten för frågor och uppdateringar så att alla
                ser samma information direkt.
              </p>
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section
          id="who-for"
          className="mt-14 border-t border-slate-800 pt-10 md:mt-20"
        >
          <h2 className="text-lg font-semibold text-slate-50">
            Gjord för mindre bygg- och hantverksföretag
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300">
              <h3 className="mb-2 text-sm font-semibold text-slate-100">
                Ventilation & VVS
              </h3>
              <p>
                När du ofta samordnar med snickare och elektriker i mindre
                ombyggnationer.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300">
              <h3 className="mb-2 text-sm font-semibold text-slate-100">
                Mindre byggfirmor
              </h3>
              <p>
                För dig som driver många kortare projekt och vill slippa leta
                info i sms-trådar.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300">
              <h3 className="mb-2 text-sm font-semibold text-slate-100">
                Fastighetsägare & förvaltare
              </h3>
              <p>
                När du återkommer till samma hantverkare och vill ha ordning på
                projekten utan tunga system.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-800 pt-6 text-xs text-slate-500 md:mt-16">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()} Byggarportalen. Alla rättigheter
              förbehållna.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#" className="hover:text-slate-300">
                Integritet & cookies
              </a>
              <a href="#" className="hover:text-slate-300">
                Kontakt
              </a>
              <a href="#" className="hover:text-slate-300">
                X / Twitter
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
