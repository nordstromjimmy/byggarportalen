import ProjectPageClient from "@/app/components/ProjectPageClient";
import { Suspense } from "react";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="mt-4 text-sm text-slate-400">Hämtar projekt…</div>
      }
    >
      <ProjectPageClient projectId={id} />
    </Suspense>
  );
}
