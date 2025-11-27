import ProjectsClient from "@/app/components/ProjectsClient";

export default function ProjectsPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-100">Projekt</h1>
      <p className="mt-1 text-sm text-slate-400">
        Hantera dina projekt. Här kan du skapa nya projekt och få en snabb
        överblick över aktiva projekt.
      </p>

      <ProjectsClient />
    </div>
  );
}
