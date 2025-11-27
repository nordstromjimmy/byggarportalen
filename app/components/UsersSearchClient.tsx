"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  company: string | null;
  occupation_type: string | null;
  phone: string | null;
};

export default function UsersSearchClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setHasSearched(true);

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, company, occupation_type, phone")
        .or(`full_name.ilike.%${trimmed}%,company.ilike.%${trimmed}%`)
        .order("full_name", { ascending: true });

      if (error) {
        console.error(error);
        setErrorMsg("Kunde inte söka användare.");
        setResults([]);
      } else {
        setResults((data || []) as UserProfile[]);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Tekniskt fel vid sökning.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      {/* Search form */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:flex-row sm:items-center"
      >
        <div className="flex-1">
          <label className="mb-1 block text-xs text-slate-300">
            Sök på namn eller företag
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none placeholder-slate-500 focus:border-sky-500"
            placeholder="t.ex. Anders eller Vent & Bygg AB"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-6 sm:self-end cursor-pointer"
        >
          {loading ? "Söker…" : "Sök"}
        </button>
      </form>

      {errorMsg && <p className="mt-3 text-xs text-red-400">{errorMsg}</p>}

      {/* Results */}
      <div className="mt-5">
        {!loading && hasSearched && results.length === 0 && !errorMsg && (
          <p className="text-sm text-slate-400">
            Inga användare hittades för &quot;{query}&quot;.
          </p>
        )}

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {results.map((user) => (
            <div
              key={user.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    {user.full_name || "Namn saknas"}
                  </h3>
                  {user.company && (
                    <p className="text-xs text-slate-400">{user.company}</p>
                  )}
                </div>
              </div>

              {user.occupation_type && (
                <p className="mt-2 text-xs text-slate-300">
                  Yrkesroll: {user.occupation_type}
                </p>
              )}

              {user.phone && (
                <p className="mt-2 text-xs text-slate-300">
                  Telefon: {user.phone}
                </p>
              )}

              {user.email && (
                <p className="mt-2 text-xs text-slate-300">
                  E-post:{" "}
                  <a
                    href={`mailto:${user.email}`}
                    className="text-sky-400 hover:text-sky-300"
                  >
                    {user.email}
                  </a>
                </p>
              )}
              {!user.email && !user.occupation_type && !user.phone && (
                <p className="mt-2 text-xs text-slate-500">
                  Ingen ytterligare info angiven ännu.
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
