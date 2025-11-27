"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
};

export default function ProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showNewForm, setShowNewForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // New project form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProjects() {
      setLoading(true);
      setErrorMsg(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (!isMounted) return;
        setErrorMsg("Kunde inte hämta användare. Försök logga in igen.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.error(error);
        setErrorMsg("Kunde inte hämta projekt.");
      } else if (data) {
        setProjects(data as Project[]);
      }

      setLoading(false);
    }

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleCreateProject(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMsg("Ingen användare inloggad. Försök logga in igen.");
        return;
      }

      if (!name.trim()) {
        setErrorMsg("Projektet måste ha ett namn.");
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .insert({
          owner_id: user.id,
          name: name.trim(),
          address: address.trim() || null,
          description: description.trim() || null,
          start_date: startDate || null,
          end_date: endDate || null,
          status: "planned",
        })
        .select()
        .single();

      if (error) {
        console.error(error);
        setErrorMsg("Kunde inte skapa projekt.");
        return;
      }

      // Prepend new project to list
      setProjects((prev) => [data as Project, ...prev]);

      // Reset form
      setName("");
      setAddress("");
      setStartDate("");
      setEndDate("");
      setDescription("");
      setShowNewForm(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("Tekniskt fel vid skapande av projekt.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-slate-100">Dina projekt</h2>
        <button
          onClick={() => setShowNewForm((v) => !v)}
          className="inline-flex items-center rounded-lg bg-sky-500 px-4 py-1.5 text-sm font-semibold text-slate-950 hover:bg-sky-400 cursor-pointer"
        >
          {showNewForm ? "Avbryt" : "Nytt projekt"}
        </button>
      </div>

      {/* New project form */}
      {showNewForm && (
        <form
          onSubmit={handleCreateProject}
          className="mt-4 grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-slate-300">
              Projektnamn *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none placeholder-slate-500 focus:border-sky-500"
              placeholder="t.ex. Ombyggnad kontor plan 3"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-300">Adress</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none placeholder-slate-500 focus:border-sky-500"
              placeholder="t.ex. Storgatan 10, Stockholm"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-slate-300">
                Startdatum
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-slate-300">
                Slutdatum
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none placeholder-slate-500 focus:border-sky-500"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-slate-300">
              Kort beskrivning
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none placeholder-slate-500 focus:border-sky-500"
              placeholder="t.ex. Mindre ombyggnad, ventilation + el, klart v.15"
            />
          </div>

          {errorMsg && (
            <p className="sm:col-span-2 text-xs text-red-400">{errorMsg}</p>
          )}

          <div className="sm:col-span-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowNewForm(false)}
              className="rounded-lg border border-slate-700 px-4 py-1.5 text-sm text-slate-200 hover:bg-slate-800/60 cursor-pointer"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-sky-500 px-4 py-1.5 text-sm font-semibold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {saving ? "Skapar…" : "Skapa projekt"}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="mt-6">
        {loading && <p className="text-sm text-slate-400">Hämtar projekt…</p>}

        {!loading && projects.length === 0 && (
          <p className="text-sm text-slate-400">
            Inga projekt än. Klicka på{" "}
            <span className="font-semibold">"Nytt projekt"</span> för att skapa
            ett.
          </p>
        )}

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 hover:border-sky-500/50 hover:bg-slate-900"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-100">
                  {project.name}
                </h3>
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-[11px] text-slate-100 " +
                    (project.status === "completed"
                      ? "bg-emerald-500/30"
                      : project.status === "ongoing"
                      ? "bg-sky-500/30"
                      : "bg-slate-700/80")
                  }
                >
                  {project.status === "planned"
                    ? "Planerat"
                    : project.status === "ongoing"
                    ? "Pågår"
                    : "Avslutat"}
                </span>
              </div>

              {project.address && (
                <p className="mt-1 text-xs text-slate-400">{project.address}</p>
              )}

              <p className="mt-2 line-clamp-2 text-xs text-slate-300">
                {project.description || "Ingen beskrivning angiven."}
              </p>

              <p className="mt-3 text-[11px] text-slate-500">
                Skapad:{" "}
                {new Date(project.created_at).toLocaleDateString("sv-SE")}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
