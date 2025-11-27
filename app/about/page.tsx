import Link from "next/link";

export default function IntegritetPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="text-2xl font-semibold text-sky-300 hover:text-sky-300 transition"
          >
            Byggarportalen.se
          </Link>
        </div>
        <h1 className="text-xl font-semibold">Om Byggarportalen</h1>
        <p className="mt-3 text-sm text-slate-300">
          Byggarportalen är för närvarande under utveckling. Vi behandlar endast
          nödvändig teknisk information (såsom serverloggar) för att kunna driva
          webbplatsen.
        </p>

        <p className="mt-3 text-sm text-slate-300">
          När tjänsten lanseras kommer en fullständig integritetspolicy att
          publiceras här, inklusive information om personuppgifter, lagring,
          behandlingsändamål och kontaktuppgifter för dataskyddsansvarig.
        </p>

        <p className="mt-3 text-sm text-slate-300">
          Om du har frågor redan nu är du välkommen att kontakta oss via{" "}
          <Link
            href="mailto:info@byggarportalen.se"
            className="text-sky-400 hover:text-sky-300"
          >
            info@byggarportalen.se
          </Link>
        </p>
      </div>
    </main>
  );
}
