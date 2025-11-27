import UsersSearchClient from "@/app/components/UsersSearchClient";

export default function UsersPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-100">Användare</h1>
      <p className="mt-1 text-sm text-slate-400">
        Sök efter användare baserat på namn eller företagsnamn.
      </p>

      <UsersSearchClient />
    </div>
  );
}
