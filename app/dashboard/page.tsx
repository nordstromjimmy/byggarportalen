import Link from "next/link";

export default function DashboardHome() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-100">Översikt</h1>

      <p className="mt-2 text-sm text-slate-400">
        Här ser du dina senaste projekt och snabba genvägar.
      </p>

      {/* Quick cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <Link href="/dashboard/projects">
            <h2 className="text-sm font-semibold">Projekt</h2>
            <p className="mt-1 text-xs text-slate-400">
              Hantera alla dina projekt
            </p>
          </Link>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <Link href="dashboard/settings">
            <h2 className="text-sm font-semibold">Inställningar</h2>
            <p className="mt-1 text-xs text-slate-400">
              Ändra kontaktinställningar
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
