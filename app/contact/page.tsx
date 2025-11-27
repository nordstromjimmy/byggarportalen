import Link from "next/link";

export default function KontaktPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-12">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="text-2xl font-semibold text-sky-300 hover:text-sky-300 transition"
          >
            Byggarportalen.se
          </Link>
        </div>
        <h1 className="text-xl font-semibold">Kontakt</h1>

        <p className="mt-3 text-sm text-slate-300">
          Har du frågor eller vill komma i kontakt med oss?
        </p>

        <p className="mt-3 text-sm text-slate-300">Du kan nå oss via e-post:</p>

        <Link
          href="mailto:info@byggarportalen.se"
          className="mt-1 text-sm font-medium text-sky-400"
        >
          info@byggarportalen.se
        </Link>

        <p className="mt-6 text-sm text-slate-400">
          Byggarportalen utvecklas just nu och tjänsten kommer öppnas upp
          stegvis. Vi uppskattar all feedback och frågor!
        </p>
      </div>
    </main>
  );
}
