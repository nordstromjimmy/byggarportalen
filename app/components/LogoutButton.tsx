"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full ounded px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800/60 hover:text-slate-100 transition cursor-pointer"
    >
      Logga ut
    </button>
  );
}
