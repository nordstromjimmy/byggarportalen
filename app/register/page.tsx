import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        {/* Brand link */}
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="text-xl font-semibold text-sky-400 hover:text-sky-300 transition"
          >
            Byggarportalen
          </Link>
        </div>

        {/* Coming soon box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl text-center">
          <h1 className="text-xl font-semibold text-slate-100">
            Registrering ej öppen ännu
          </h1>

          <p className="mt-3 text-sm text-slate-300">
            Webbplatsen är fortfarande under utveckling.
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Snart kan du skapa konto och börja använda Byggarportalen.
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-sky-500 px-6 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400"
          >
            Tillbaka till startsidan
          </Link>
        </div>
      </div>
    </main>
  );
}
