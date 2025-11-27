import Link from "next/link";
import LogoutButton from "../components/LogoutButton";
import MobileNav from "../components/MobileNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 border-r border-slate-800 bg-slate-900/60 p-4 md:flex md:flex-col">
        <Link
          href="/dashboard"
          className="mb-6 text-lg font-semibold text-slate-100 hover:text-sky-300"
        >
          Byggarportalen
        </Link>

        <nav className="flex flex-1 flex-col gap-2 text-sm">
          <Link
            href="/dashboard"
            className="rounded px-3 py-2 hover:bg-slate-800/60"
          >
            🏠 Översikt
          </Link>
          <Link
            href="/dashboard/projects"
            className="rounded px-3 py-2 hover:bg-slate-800/60"
          >
            📁 Projekt
          </Link>
          <Link
            href="/dashboard/settings"
            className="rounded px-3 py-2 hover:bg-slate-800/60"
          >
            ⚙️ Inställningar
          </Link>
        </nav>

        <div className="mt-4 border-t border-slate-800 pt-4">
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile topbar */}
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3 md:hidden">
        <Link
          href="/dashboard"
          className="text-base font-semibold text-slate-100"
        >
          Byggarportalen
        </Link>
        <MobileNav />
      </header>

      {/* Page content */}
      <main className="flex-1 p-4 pt-16 md:pt-4">{children}</main>
    </div>
  );
}
