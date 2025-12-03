"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ProjectMembersSection } from "./ProjectMembersSection";
import ProjectTimeTableSection from "./ProjectTimeTableSection";
import ProjectChatSection from "./ProjectChatSection";
import ConfirmDialog from "./ConfirmDialog";

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
  tidsplan_image_url: string | null;
  tidsplan_image_path: string | null;
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

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const isOwner =
    !!currentUserId && !!project && currentUserId === project.owner_id;

  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Editable fields (for simple inline edit of name/description)
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProject() {
      setLoading(true);
      setErrorMsg(null);

      // Fetch current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (isMounted) {
          setErrorMsg("Kunde inte hämta användare.");
          setLoading(false);
        }
        return;
      }

      if (isMounted) setCurrentUserId(user.id);

      // Load **ONLY this project**
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        console.error(error);
        setErrorMsg("Kunde inte hämta projektet.");
        setLoading(false);
        return;
      }

      if (!data) {
        setErrorMsg("Projektet hittades inte eller du har inte behörighet.");
        setLoading(false);
        return;
      }

      setProject(data as Project);

      // Pre-fill editable fields
      setName(data.name);
      setAddress(data.address ?? "");
      setDescription(data.description ?? "");
      setStartDate(data.start_date ?? "");
      setEndDate(data.end_date ?? "");

      setLoading(false);
    }

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  async function handleStatusChange(newStatus: Project["status"]) {
    if (!project || updatingStatus || !isOwner) return;
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
    if (!project || !isOwner) return;

    setSavingDetails(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase
        .from("projects")
        .update({
          name,
          address: address || null,
          description: description || null,
          start_date: startDate || null,
          end_date: endDate || null,
        })
        .eq("id", project.id)
        .select("*")
        .maybeSingle();

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
    if (!project || !isOwner) return;

    setErrorMsg(null);
    setDeletingProject(true);

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

      // Stäng dialogen och gå tillbaka till projektlistan
      setConfirmDeleteProject(false);
      router.push("/dashboard/projects");
    } catch (err) {
      console.error(err);
      setErrorMsg("Tekniskt fel vid borttagning.");
    } finally {
      setDeletingProject(false);
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

        {isOwner && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setEditMode((v) => !v)}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-800/60 cursor-pointer"
            >
              {editMode ? "Avbryt redigering" : "Redigera info"}
            </button>
            <button
              onClick={() => setConfirmDeleteProject(true)}
              className="rounded-lg border border-red-500/60 px-3 py-1.5 text-xs text-red-200 hover:bg-red-950/50 cursor-pointer"
            >
              Ta bort projekt
            </button>
          </div>
        )}
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

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-slate-300">
                      Startdatum
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none placeholder-slate-500 focus:border-sky-500"
                    />
                  </div>
                  <div>
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
                    className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-800/60 cursor-pointer"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    disabled={savingDetails}
                    className="rounded-lg bg-sky-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
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
                disabled={updatingStatus || !isOwner}
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
                disabled={updatingStatus || !isOwner}
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
                disabled={updatingStatus || !isOwner}
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

          <ProjectChatSection
            projectId={project.id}
            currentUserId={currentUserId}
          />
        </div>

        {/* Right: sections for this project */}
        <div className="space-y-4">
          <ProjectTimeTableSection
            projectId={project.id}
            isOwner={isOwner}
            tidsplanImageUrl={project.tidsplan_image_url}
            tidsplanImagePath={project.tidsplan_image_path}
            onImageChange={({ url, path }) =>
              setProject((prev) =>
                prev
                  ? {
                      ...prev,
                      tidsplan_image_url: url,
                      tidsplan_image_path: path,
                    }
                  : prev
              )
            }
          />

          <ProjectMembersSection projectId={project.id} isOwner={isOwner} />
        </div>
      </div>
      <ConfirmDialog
        open={confirmDeleteProject}
        title="Ta bort projekt"
        description="Är du säker på att du vill ta bort det här projektet? Alla kopplade data (deltagare, chatt, tidsplan) kommer att försvinna."
        confirmLabel="Ta bort projekt"
        cancelLabel="Avbryt"
        variant="danger"
        loading={deletingProject}
        onClose={() => {
          if (!deletingProject) setConfirmDeleteProject(false);
        }}
        onConfirm={() => {
          void handleDeleteProject();
        }}
      />
    </div>
  );
}
