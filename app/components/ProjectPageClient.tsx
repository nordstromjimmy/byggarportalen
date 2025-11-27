"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Project = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  address: string | null;
  status: "planned" | "ongoing" | "completed" | string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

export default function ProjectPageClient({
  projectId,
}: {
  projectId: string;
}) {
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Editable fields (for simple inline edit of name/description)
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProject() {
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
        .eq("id", projectId)
        .eq("owner_id", user.id) // extra safety on client
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        console.error(error);
        setErrorMsg("Kunde inte hämta projekt.");
      } else if (!data) {
        setErrorMsg("Projektet hittades inte.");
      } else {
        const p = data as Project;
        setProject(p);
        setName(p.name);
        setAddress(p.address ?? "");
        setDescription(p.description ?? "");
      }

      setLoading(false);
    }

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  async function handleStatusChange(newStatus: Project["status"]) {
    if (!project || updatingStatus) return;
    setUpdatingStatus(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from("projects")
        .update({ status: newStatus })
        .eq("id", project.id);

      if (error) {
        console.error(error);
        setErrorMsg("Kunde inte uppdatera status.");
        return;
      }

      setProject((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch (err) {
      console.error(err);
      setErrorMsg("Tekniskt fel vid uppdatering av status.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleSaveDetails(e: FormEvent) {
    e.preventDefault();
    if (!project) return;

    setSavingDetails(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase
        .from("projects")
        .update({
          name: name.trim() || project.name,
          address: address.trim() || null,
          description: description.trim() || null,
        })
        .eq("id", project.id)
        .select()
        .single();

      if (error) {
        console.error(error);
        setErrorMsg("Kunde inte spara projektinfo.");
        return;
      }

      setProject(data as Project);
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("Tekniskt fel vid sparande.");
    } finally {
      setSavingDetails(false);
    }
  }

  async function handleDeleteProject() {
    if (!project) return;

    const confirmed = window.confirm(
      "Är du säker på att du vill ta bort projektet? Detta går inte att ångra."
    );
    if (!confirmed) return;

    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id);

      if (error) {
        console.error(error);
        setErrorMsg("Kunde inte ta bort projektet.");
        return;
      }

      // After delete, go back to projects list
      router.push("/dashboard/projects");
    } catch (err) {
      console.error(err);
      setErrorMsg("Tekniskt fel vid borttagning.");
    }
  }

  function renderStatusBadge(status: Project["status"]) {
    if (status === "ongoing") {
      return (
        <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[11px] font-medium text-sky-300">
          Pågår
        </span>
      );
    }
    if (status === "completed") {
      return (
        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
          Avslutat
        </span>
      );
    }
    return (
      <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-[11px] font-medium text-slate-200">
        Planerat
      </span>
    );
  }

  if (loading) {
    return <div className="mt-4 text-sm text-slate-400">Hämtar projekt…</div>;
  }

  if (errorMsg && !project) {
    return (
      <div className="mt-4 rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200">
        {errorMsg}
        <div className="mt-3">
          <button
            onClick={() => router.push("/dashboard/projects")}
            className="rounded-lg border border-red-400/60 px-3 py-1 text-xs text-red-100 hover:bg-red-900/40"
          >
            Tillbaka till projektlistan
          </button>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="mt-2 space-y-6">
      {/* Breadcrumb + top row */}
      <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 text-xs text-slate-500">
            <Link href="/dashboard/projects" className="hover:text-slate-300">
              Projekt
            </Link>{" "}
            / <span className="text-slate-300">Detaljer</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold text-slate-100">
              {project.name}
            </h1>
            {renderStatusBadge(project.status)}
          </div>
          {project.address && (
            <p className="mt-1 text-xs text-slate-400">{project.address}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setEditMode((v) => !v)}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-800/60 cursor-pointer"
          >
            {editMode ? "Avbryt redigering" : "Redigera info"}
          </button>
          <button
            onClick={handleDeleteProject}
            className="rounded-lg border border-red-500/60 px-3 py-1.5 text-xs text-red-200 hover:bg-red-950/50 cursor-pointer"
          >
            Ta bort projekt
          </button>
        </div>
      </div>

      {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}

      {/* Main layout: left info, right future panels */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
        {/* Left: basic info */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <h2 className="text-sm font-semibold text-slate-100">Grundinfo</h2>

            {!editMode ? (
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                  <span>
                    Skapad:{" "}
                    {new Date(project.created_at).toLocaleDateString("sv-SE")}
                  </span>
                  {project.start_date && (
                    <span>
                      Start:{" "}
                      {new Date(project.start_date).toLocaleDateString("sv-SE")}
                    </span>
                  )}
                  {project.end_date && (
                    <span>
                      Slut:{" "}
                      {new Date(project.end_date).toLocaleDateString("sv-SE")}
                    </span>
                  )}
                </div>

                <div className="pt-2 text-sm text-slate-300">
                  <p className="mb-1 text-xs font-semibold text-slate-400">
                    Beskrivning
                  </p>
                  <p className="whitespace-pre-line text-sm">
                    {project.description || "Ingen beskrivning angiven ännu."}
                  </p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSaveDetails}
                className="mt-3 space-y-3 text-sm"
              >
                <div>
                  <label className="mb-1 block text-xs text-slate-300">
                    Projektnamn
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none placeholder-slate-500 focus:border-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-300">
                    Adress
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none placeholder-slate-500 focus:border-sky-500"
                    placeholder="t.ex. Storgatan 10, Stockholm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-300">
                    Beskrivning
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none placeholder-slate-500 focus:border-sky-500"
                    placeholder="Kort beskrivning av projektet…"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setName(project.name);
                      setAddress(project.address ?? "");
                      setDescription(project.description ?? "");
                    }}
                    className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-800/60"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    disabled={savingDetails}
                    className="rounded-lg bg-sky-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingDetails ? "Sparar…" : "Spara"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Status control */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <h2 className="text-sm font-semibold text-slate-100">Status</h2>
            <p className="mt-1 text-xs text-slate-400">
              Uppdatera var i processen projektet är.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => handleStatusChange("planned")}
                disabled={updatingStatus}
                className={
                  "rounded-full px-3 py-1 " +
                  (project.status === "planned"
                    ? "bg-slate-700 text-slate-50"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer")
                }
              >
                Planerat
              </button>
              <button
                onClick={() => handleStatusChange("ongoing")}
                disabled={updatingStatus}
                className={
                  "rounded-full px-3 py-1 " +
                  (project.status === "ongoing"
                    ? "bg-sky-500 text-slate-950"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer")
                }
              >
                Pågår
              </button>
              <button
                onClick={() => handleStatusChange("completed")}
                disabled={updatingStatus}
                className={
                  "rounded-full px-3 py-1 " +
                  (project.status === "completed"
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer")
                }
              >
                Avslutat
              </button>
            </div>
          </div>
        </div>

        {/* Right: placeholders for future features */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <h2 className="text-sm font-semibold text-slate-100">
              Tidsplan (kommer snart)
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Här kommer du kunna lägga upp en enkel vecka-för-vecka-plan med
              ansvarig yrkesgrupp för varje moment.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <h2 className="text-sm font-semibold text-slate-100">
              Deltagare (kommer snart)
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Lägg till snickare, ventilation, elektriker m.fl. och samla alla
              kontaktuppgifter för projektet.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <h2 className="text-sm font-semibold text-slate-100">
              Chatt (kommer snart)
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              En egen chatt för detta projekt där alla yrkesgrupper kan ställa
              frågor och uppdatera varandra.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
