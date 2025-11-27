"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  full_name: string | null;
  phone: string | null;
  company: string | null;
  occupation_type: string | null;
};

export default function SettingsForm() {
  const [initialEmail, setInitialEmail] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    phone: "",
    company: "",
    occupation_type: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setLoading(true);
      setErrorMsg(null);

      // 1) Get current user
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

      // Set email from auth
      if (isMounted) {
        setInitialEmail(user.email ?? "");
        setEmail(user.email ?? "");
      }

      // 2) Get profile row
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        console.error(error);
        setErrorMsg("Kunde inte hämta profil.");
      } else if (data) {
        setProfile({
          full_name: data.full_name,
          phone: data.phone,
          company: data.company,
          occupation_type: data.occupation_type,
        });
      } else {
        // No profile yet – keep defaults
      }

      setLoading(false);
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
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

      // 1) Update email if changed
      if (email && email !== initialEmail) {
        const { error: emailError } = await supabase.auth.updateUser({
          email,
        });

        if (emailError) {
          console.error(emailError);
          setErrorMsg(
            emailError.message ||
              "Kunde inte uppdatera e-post. Kontrollera adressen."
          );
          return;
        }
        setInitialEmail(email);
      }

      // 2) Upsert profile
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          full_name: profile.full_name,
          phone: profile.phone,
          company: profile.company,
          occupation_type: profile.occupation_type,
        },
        { onConflict: "id" }
      );

      if (profileError) {
        console.error(profileError);
        setErrorMsg("Kunde inte spara profil.");
        return;
      }

      setMessage("Profil uppdaterad.");
    } catch (err) {
      console.error(err);
      setErrorMsg("Tekniskt fel vid sparande.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="mt-4 text-sm text-slate-400">Laddar..</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4">
      {/* Email */}
      <div>
        <label className="mb-1 block text-sm text-slate-300">
          E-postadress
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none placeholder-slate-500 focus:border-sky-500"
          placeholder="din@epost.se"
        />
        <p className="mt-1 text-xs text-slate-500">
          Används för inloggning och aviseringar.
        </p>
      </div>

      {/* Name */}
      <div>
        <label className="mb-1 block text-sm text-slate-300">Namn</label>
        <input
          type="text"
          value={profile.full_name ?? ""}
          onChange={(e) =>
            setProfile((p) => ({ ...p, full_name: e.target.value }))
          }
          className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none placeholder-slate-500 focus:border-sky-500"
          placeholder="För- och efternamn"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="mb-1 block text-sm text-slate-300">Telefon</label>
        <input
          type="tel"
          value={profile.phone ?? ""}
          onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
          className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none placeholder-slate-500 focus:border-sky-500"
          placeholder="070-123 45 67"
        />
      </div>

      {/* Company */}
      <div>
        <label className="mb-1 block text-sm text-slate-300">Företag</label>
        <input
          type="text"
          value={profile.company ?? ""}
          onChange={(e) =>
            setProfile((p) => ({ ...p, company: e.target.value }))
          }
          className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none placeholder-slate-500 focus:border-sky-500"
          placeholder="Ditt företagsnamn"
        />
      </div>

      {/* Occupation type */}
      <div>
        <label className="mb-1 block text-sm text-slate-300">
          Yrkesroll / typ av arbete
        </label>
        <input
          type="text"
          value={profile.occupation_type ?? ""}
          onChange={(e) =>
            setProfile((p) => ({ ...p, occupation_type: e.target.value }))
          }
          className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none placeholder-slate-500 focus:border-sky-500"
          placeholder="t.ex. Ventilationsmontör, Elektriker, Snickare…"
        />
      </div>

      {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
      {message && !errorMsg && (
        <p className="text-xs text-emerald-400">{message}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
      >
        {saving ? "Sparar…" : "Spara ändringar"}
      </button>
    </form>
  );
}
