import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  Plus,
  FolderOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProjectScoreBadge } from "@/components/project-score-badge";
import { ProjectValuationRange } from "@/components/project-valuation-range";

export default async function ProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all user's projects with latest analysis and valuation
  const { data: projects } = await supabase
    .from("projects")
    .select(
      `
      *,
      analyses (
        id,
        overall_score,
        created_at,
        valuations (
          estimated_value,
          min_value,
          max_value
        )
      )
    `
    )
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  // Get latest analysis for each project
  const projectsWithLatestAnalysis =
    projects?.map((project: any) => {
      const latestAnalysis =
        project.analyses?.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0] || null;

      return {
        ...project,
        latestAnalysis,
        latestValuation: latestAnalysis?.valuations?.[0] || null,
      };
    }) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Mis Proyectos</h2>
          <p className="text-muted-foreground">
            Gestiona todos tus proyectos y auditorías
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/new">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proyecto
          </Link>
        </Button>
      </div>

      {projectsWithLatestAnalysis && projectsWithLatestAnalysis.length > 0 ? (
        <div className="grid gap-4">
          {projectsWithLatestAnalysis.map((project: any) => (
            <Card key={project.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FolderOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{project.name}</h4>
                        {project.status === "completed" && (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Completado
                          </Badge>
                        )}
                        {project.status === "analyzing" && (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Analizando
                          </Badge>
                        )}
                        {project.status === "pending" && (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Pendiente
                          </Badge>
                        )}
                        {project.status === "failed" && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Error
                          </Badge>
                        )}
                      </div>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {project.source_type === "github"
                            ? "GitHub"
                            : "Subido"}
                        </span>
                        <span>{project.file_count} archivos</span>
                        <span>
                          {project.total_lines?.toLocaleString()} líneas
                        </span>
                        <span>
                          {new Date(project.created_at).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      {project.latestAnalysis && (
                        <div className="flex items-center gap-3 mt-2">
                          <ProjectScoreBadge
                            score={project.latestAnalysis.overall_score}
                          />
                          {project.latestValuation && (
                            <ProjectValuationRange
                              minValue={project.latestValuation.min_value}
                              maxValue={project.latestValuation.max_value}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/projects/${project.id}`}>
                      Ver Detalles
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No tienes proyectos aún
            </p>
            <Button asChild>
              <Link href="/dashboard/new">
                <Plus className="h-4 w-4 mr-2" />
                Crear tu Primer Proyecto
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
