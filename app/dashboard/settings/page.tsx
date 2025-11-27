import SettingsForm from "@/app/components/SettingsForm";
import { Suspense } from "react";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-100">Inställningar</h1>
      <p className="mt-1 text-sm text-slate-400">
        Hantera dina personliga uppgifter. Dessa används i projekt och
        kontaktlistor.
      </p>

      <Suspense
        fallback={<div className="mt-4 text-sm text-slate-400">Laddar..</div>}
      >
        <SettingsForm />
      </Suspense>
    </div>
  );
}
