"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

const navLinks = [
  { href: "/app", label: "Översikt", icon: "🏠" },
  { href: "/app/projects", label: "Projekt", icon: "📁" },
  { href: "/app/settings", label: "Inställningar", icon: "⚙️" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function close() {
    setOpen(false);
  }

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900/80 px-2.5 py-1.5 text-sm text-slate-100 shadow-sm hover:border-slate-500 hover:bg-slate-900"
        aria-label="Öppna meny"
      >
        <span className="mr-1 text-xs">Meny</span>
        <span className="flex flex-col gap-[3px]">
          <span className="h-[2px] w-4 bg-slate-100"></span>
          <span className="h-[2px] w-4 bg-slate-100"></span>
        </span>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={close}
        />
      )}

      {/* Slide-out menu */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-64 transform border-l border-slate-800 bg-slate-900/95 p-4 shadow-xl transition-transform duration-200 md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-100">Meny</span>
          <button
            onClick={close}
            className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            Stäng
          </button>
        </div>

        <nav className="flex flex-col gap-1 text-sm">
          {navLinks.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className={`flex items-center gap-2 rounded px-3 py-2 ${
                  active
                    ? "bg-slate-800 text-slate-50"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-slate-100"
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 border-t border-slate-800 pt-3">
          <LogoutButton />
        </div>
      </div>
    </>
  );
}
