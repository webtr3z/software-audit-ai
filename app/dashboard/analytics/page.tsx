import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProjectsTable } from "@/components/projects-table";
import { BarChart3 } from "lucide-react";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch all user's projects with latest analysis
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select(
      `
      *,
      analyses (
        id,
        overall_score,
        created_at
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Log for debugging
  console.log("[v0 Analytics] User ID:", user.id);
  console.log("[v0 Analytics] Projects fetched:", projects?.length || 0);
  console.log("[v0 Analytics] Error:", projectsError);

  if (projectsError) {
    console.error("[v0 Analytics] Error fetching projects:", projectsError);
  }

  // Transform data to include latest analysis
  const projectsWithAnalysis =
    projects?.map((project: any) => {
      const latestAnalysis = project.analyses?.sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      return {
        id: project.id,
        name: project.name,
        status: project.status,
        score: latestAnalysis?.overall_score || null,
        createdAt: project.created_at,
        lastAnalysisDate: latestAnalysis?.created_at || null,
        fileCount: project.file_count || 0,
        totalLines: project.total_lines || 0,
      };
    }) || [];

  console.log(
    "[v0 Analytics] Projects with analysis:",
    projectsWithAnalysis.length
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Analítica de Proyectos
        </h2>
        <p className="text-muted-foreground">
          Selecciona múltiples proyectos para generar un reporte consolidado
        </p>
      </div>

      {projectsError && (
        <div className="border border-destructive rounded-lg p-4 text-destructive">
          Error al cargar proyectos: {projectsError.message}
        </div>
      )}

      <ProjectsTable projects={projectsWithAnalysis} userId={user.id} />
    </div>
  );
}
