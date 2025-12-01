"use client";

import { useState, useEffect, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  company: string | null;
  occupation_type: string | null;
  phone: string | null;
};

type ProjectMemberWithProfile = {
  id: string;
  role: string | null;
  profiles: Profile;
};

export function ProjectMembersSection({
  projectId,
  isOwner,
}: {
  projectId: string;
  isOwner: boolean;
}) {
  const [members, setMembers] = useState<ProjectMemberWithProfile[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const [roleByUser, setRoleByUser] = useState<Record<string, string>>({});

  // Load current members
  useEffect(() => {
    let isMounted = true;

    async function loadMembers() {
      setLoadingMembers(true);
      setMembersError(null);

      const { data, error } = await supabase
        .from("project_members")
        .select(
          `
          id,
          role,
          profiles (
            id,
            email,
            full_name,
            company,
            occupation_type,
            phone
          )
        `
        )
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (!isMounted) return;

      if (error) {
        console.error(error);
        setMembersError("Kunde inte hämta deltagare.");
      } else {
        setMembers((data || []) as unknown as ProjectMemberWithProfile[]);
      }

      setLoadingMembers(false);
    }

    loadMembers();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // Search existing users (profiles)
  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    setSearchError(null);

    const trimmed = search.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }

    setSearching(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, company, occupation_type, phone")
        .or(
          `full_name.ilike.%${trimmed}%,company.ilike.%${trimmed}%,email.ilike.%${trimmed}%`
        )
        .order("full_name", { ascending: true });

      if (error) {
        console.error(error);
        setSearchError("Kunde inte söka användare.");
        setSearchResults([]);
      } else {
        setSearchResults((data || []) as Profile[]);
      }
    } catch (err) {
      console.error(err);
      setSearchError("Tekniskt fel vid sökning.");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  const memberUserIds = new Set(
    members.map((m) => m.profiles?.id).filter(Boolean) as string[]
  );

  async function handleAddToProject(profile: Profile) {
    if (!isOwner) return;
    if (!profile.id) return;
    if (memberUserIds.has(profile.id)) return;

    setSearchError(null);
    setAddingUserId(profile.id);

    const role = roleByUser[profile.id] || null;

    try {
      const { data, error } = await supabase
        .from("project_members")
        .insert({
          project_id: projectId,
          user_id: profile.id,
          role,
        })
        .select(
          `
          id,
          role,
          profiles (
            id,
            email,
            full_name,
            company,
            occupation_type,
            phone
          )
        `
        )
        .single();

      if (error) {
        console.error(error);
        setSearchError("Kunde inte lägga till användaren i projektet.");
        return;
      }

      setMembers((prev) => [
        ...prev,
        data as unknown as ProjectMemberWithProfile,
      ]);

      // Clear role for that user
      setRoleByUser((prev) => {
        const copy = { ...prev };
        delete copy[profile.id];
        return copy;
      });
    } catch (err) {
      console.error(err);
      setSearchError("Tekniskt fel vid tillägg.");
    } finally {
      setAddingUserId(null);
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!isOwner) return;

    const confirmed = window.confirm("Ta bort denna användare från projektet?");
    if (!confirmed) return;

    setMembersError(null);

    try {
      const { error } = await supabase
        .from("project_members")
        .delete()
        .eq("id", memberId);

      if (error) {
        console.error(error);
        setMembersError("Kunde inte ta bort deltagare.");
        return;
      }

      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      console.error(err);
      setMembersError("Tekniskt fel vid borttagning.");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <h2 className="text-sm font-semibold text-slate-100">Deltagare</h2>
      <p className="mt-1 text-xs text-slate-400">
        {isOwner
          ? "Lägg till befintliga användare i projektet."
          : "Dessa personer är kopplade till projektet."}
      </p>

      {isOwner && (
        <>
          {/* Search existing users */}
          <form
            onSubmit={handleSearch}
            className="mt-3 grid gap-2 text-xs sm:grid-cols-[minmax(0,1.7fr)_auto]"
          >
            <div>
              <label className="mb-1 block text-[11px] text-slate-300">
                Sök användare
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-xs text-slate-100 outline-none placeholder-slate-500 focus:border-sky-500"
                placeholder="Namn, företag eller e-post"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={searching}
                className="w-full rounded-lg bg-sky-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {searching ? "Söker…" : "Sök"}
              </button>
            </div>
          </form>

          {searchError && (
            <p className="mt-2 text-[11px] text-red-400">{searchError}</p>
          )}

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-[11px] text-slate-400">Sökresultat:</p>
              {searchResults.map((profile) => {
                const alreadyMember = memberUserIds.has(profile.id);

                return (
                  <div
                    key={profile.id}
                    className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    {/* left info unchanged */}
                    <div className="text-xs">
                      <div className="font-semibold text-slate-100">
                        {profile.full_name || "Namn saknas"}
                      </div>
                      {profile.company && (
                        <div className="text-[11px] text-slate-400">
                          {profile.company}
                        </div>
                      )}
                      {profile.email && (
                        <div className="mt-1 text-[11px] text-slate-300">
                          {profile.email}
                        </div>
                      )}
                      {profile.occupation_type && (
                        <div className="mt-1 text-[11px] text-slate-300">
                          {profile.occupation_type}
                        </div>
                      )}
                    </div>

                    {/* right side: role + add button */}
                    <div className="flex flex-col items-stretch gap-1 sm:items-end">
                      <input
                        type="text"
                        value={roleByUser[profile.id] ?? ""}
                        onChange={(e) =>
                          setRoleByUser((prev) => ({
                            ...prev,
                            [profile.id]: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-2 py-1 text-[11px] text-slate-100 outline-none placeholder-slate-500 focus:border-sky-500"
                        placeholder="Yrkesroll i projektet (valfritt)"
                      />
                      <button
                        type="button"
                        disabled={alreadyMember || addingUserId === profile.id}
                        onClick={() => handleAddToProject(profile)}
                        className="rounded-lg bg-sky-500 px-3 py-1 text-[11px] font-semibold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {alreadyMember
                          ? "Redan med i projektet"
                          : addingUserId === profile.id
                          ? "Lägger till…"
                          : "Lägg till i projekt"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Current members */}
      <div className="mt-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Deltagare i projektet
        </h3>

        {membersError && (
          <p className="mt-1 text-[11px] text-red-400">{membersError}</p>
        )}

        {loadingMembers && (
          <p className="mt-1 text-[11px] text-slate-400">Hämtar deltagare…</p>
        )}

        {!loadingMembers && members.length === 0 && (
          <p className="mt-1 text-[11px] text-slate-400">
            Inga deltagare tillagda ännu.
          </p>
        )}

        <div className="mt-2 space-y-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2"
            >
              <div className="text-xs">
                <div className="font-semibold text-slate-100">
                  {m.profiles?.full_name || "Namn saknas"}
                </div>
                {m.profiles?.company && (
                  <div className="text-[11px] text-slate-400">
                    {m.profiles.company}
                  </div>
                )}
                {m.profiles?.email && (
                  <div className="mt-1 text-[11px] text-slate-300">
                    {m.profiles.email}
                  </div>
                )}
                {m.profiles?.phone && (
                  <div className="mt-1 text-[11px] text-slate-300">
                    Tel: {m.profiles.phone}
                  </div>
                )}
                {(m.role || m.profiles?.occupation_type) && (
                  <div className="mt-1 text-[11px] text-slate-300">
                    {m.role || m.profiles?.occupation_type}
                  </div>
                )}
              </div>

              {isOwner && (
                <button
                  onClick={() => handleRemoveMember(m.id)}
                  className="rounded-full border border-red-500/50 px-2 py-0.5 text-[10px] text-red-200 hover:bg-red-950/60"
                >
                  Ta bort
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
