"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard"; // or "/app"

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("signIn result:", { data, error });

      if (error) {
        setErrorMsg(error.message || "Något gick fel vid inloggning.");
        return;
      }

      router.push(next);
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("Tekniskt fel vid inloggning.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        {/* Brand link */}
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="text-xl font-semibold text-slate-100 hover:text-sky-300 transition"
          >
            Byggarportalen
          </Link>
        </div>

        {/* Form container */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
          <h1 className="text-center text-xl font-semibold text-slate-100">
            Logga in
          </h1>
          <p className="mt-1 text-center text-sm text-slate-400">
            Välkommen tillbaka
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-300">
                E-postadress
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none placeholder-slate-500 focus:border-sky-500"
                placeholder="din@epost.se"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-300">
                Lösenord
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none placeholder-slate-500 focus:border-sky-500"
                placeholder="••••••••••"
              />
            </div>

            {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-sky-500 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Loggar in..." : "Logga in"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-400">
            Har du inget konto?{" "}
            <Link href="/register" className="text-sky-400 hover:text-sky-300">
              Skapa konto
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
