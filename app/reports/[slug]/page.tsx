import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRadarChart } from "@/components/score-radar-chart";
import {
  FileCode,
  Code2,
  Shield,
  Zap,
  Bug,
  Wrench,
  Building2,
  AlertCircle,
  DollarSign,
} from "lucide-react";

export default async function ReportIntroductionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch report
  const { data: report, error } = await supabase
    .from("consolidated_reports")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (error || !report) {
    notFound();
  }

  // Fetch all projects with analyses
  const { data: projects } = await supabase
    .from("projects")
    .select(
      `
      *,
      analyses (
        id,
        overall_score,
        security_score,
        code_quality_score,
        performance_score,
        bugs_score,
        maintainability_score,
        architecture_score,
        created_at
      )
    `
    )
    .in("id", report.project_ids);

  // Fetch all issues
  const analysisIds =
    projects?.flatMap((p: any) => p.analyses?.map((a: any) => a.id)) || [];
  const { data: allIssues } = await supabase
    .from("issues")
    .select("severity")
    .in("analysis_id", analysisIds);

  // Fetch all valuations
  const { data: allValuations } = await supabase
    .from("valuations")
    .select("estimated_value, min_value, max_value")
    .in("analysis_id", analysisIds);

  // Calculate aggregate statistics
  const projectCount = projects?.length || 0;
  const totalFiles =
    projects?.reduce((sum: number, p: any) => sum + (p.file_count || 0), 0) ||
    0;
  const totalLines =
    projects?.reduce((sum: number, p: any) => sum + (p.total_lines || 0), 0) ||
    0;

  // Get all unique languages
  const allLanguages = Array.from(
    new Set(projects?.flatMap((p: any) => p.languages || []))
  );

  // Calculate average scores
  const latestAnalyses =
    projects
      ?.map(
        (p: any) =>
          p.analyses?.sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )[0]
      )
      .filter(Boolean) || [];

  const avgOverallScore =
    latestAnalyses.reduce(
      (sum: number, a: any) => sum + (a?.overall_score || 0),
      0
    ) / (latestAnalyses.length || 1);

  const avgScores = {
    security:
      latestAnalyses.reduce(
        (sum: number, a: any) => sum + (a?.security_score || 0),
        0
      ) / (latestAnalyses.length || 1),
    codeQuality:
      latestAnalyses.reduce(
        (sum: number, a: any) => sum + (a?.code_quality_score || 0),
        0
      ) / (latestAnalyses.length || 1),
    performance:
      latestAnalyses.reduce(
        (sum: number, a: any) => sum + (a?.performance_score || 0),
        0
      ) / (latestAnalyses.length || 1),
    bugs:
      latestAnalyses.reduce(
        (sum: number, a: any) => sum + (a?.bugs_score || 0),
        0
      ) / (latestAnalyses.length || 1),
    maintainability:
      latestAnalyses.reduce(
        (sum: number, a: any) => sum + (a?.maintainability_score || 0),
        0
      ) / (latestAnalyses.length || 1),
    architecture:
      latestAnalyses.reduce(
        (sum: number, a: any) => sum + (a?.architecture_score || 0),
        0
      ) / (latestAnalyses.length || 1),
  };

  // Count issues by severity
  const criticalCount =
    allIssues?.filter((i) => i.severity === "critical").length || 0;
  const highCount = allIssues?.filter((i) => i.severity === "high").length || 0;
  const mediumCount =
    allIssues?.filter((i) => i.severity === "medium").length || 0;
  const lowCount = allIssues?.filter((i) => i.severity === "low").length || 0;

  // Calculate total valuations
  const totalEstimatedValue =
    allValuations?.reduce(
      (sum: number, v: any) => sum + (v.estimated_value || 0),
      0
    ) || 0;
  const totalMinValue =
    allValuations?.reduce(
      (sum: number, v: any) => sum + (v.min_value || 0),
      0
    ) || 0;
  const totalMaxValue =
    allValuations?.reduce(
      (sum: number, v: any) => sum + (v.max_value || 0),
      0
    ) || 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">
          {report.title || "Reporte Consolidado"}
        </h1>
        <p className="text-muted-foreground">
          {report.description ||
            `Análisis consolidado de ${projectCount} proyecto(s)`}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Generado el{" "}
          {new Date(report.created_at).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Ejecutivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-primary">
                {avgOverallScore.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">
                Puntuación Promedio
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold">{projectCount}</div>
              <div className="text-sm text-muted-foreground">
                Proyectos Analizados
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {totalFiles.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Archivos Totales
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {totalLines.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Líneas de Código
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold flex items-center gap-1">
                {formatCurrency(totalEstimatedValue)}
              </div>
              <div className="text-sm text-muted-foreground">
                Valor Estimado Total
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 border border-primary/30 bg-primary/5 p-1 rounded-lg max-w-fit px-2">
                <div className="text-lg font-bold text-primary flex items-center gap-1">
                  {formatCurrency(totalMinValue)}
                </div>
                <div className="text-primary">-</div>
                <div className="text-lg font-bold text-primary flex items-center gap-1">
                  {formatCurrency(totalMaxValue)}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Rango de Valor Total
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Scores Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Puntuaciones Promedio por Categoría</CardTitle>
          <CardDescription>
            Vista general de las puntuaciones promedio de todos los proyectos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScoreRadarChart scores={avgScores} />
        </CardContent>
      </Card>

      {/* Detailed Scores */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Seguridad</div>
                <div className="text-2xl font-bold">
                  {avgScores.security.toFixed(1)}/10
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Code2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">
                  Calidad de Código
                </div>
                <div className="text-2xl font-bold">
                  {avgScores.codeQuality.toFixed(1)}/10
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Rendimiento</div>
                <div className="text-2xl font-bold">
                  {avgScores.performance.toFixed(1)}/10
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bug className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">
                  Detección de Bugs
                </div>
                <div className="text-2xl font-bold">
                  {avgScores.bugs.toFixed(1)}/10
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">
                  Mantenibilidad
                </div>
                <div className="text-2xl font-bold">
                  {avgScores.maintainability.toFixed(1)}/10
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">
                  Arquitectura
                </div>
                <div className="text-2xl font-bold">
                  {avgScores.architecture.toFixed(1)}/10
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Problemas Detectados
          </CardTitle>
          <CardDescription>
            Total de problemas encontrados en todos los proyectos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-destructive">
                {criticalCount}
              </div>
              <Badge variant="destructive" className="mt-2">
                Críticos
              </Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-primary">{highCount}</div>
              <Badge variant="default" className="mt-2">
                Altos
              </Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-warning">
                {mediumCount}
              </div>
              <Badge variant="warning" className="mt-2">
                Medios
              </Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-info">{lowCount}</div>
              <Badge variant="info" className="mt-2">
                Bajos
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      {allLanguages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lenguajes Detectados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allLanguages.map((lang) => (
                <Badge key={lang} variant="secondary">
                  {lang}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle>Proyectos Incluidos</CardTitle>
          <CardDescription>
            Lista de proyectos analizados en este reporte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {projects?.map((project: any) => {
              const latestAnalysis = project.analyses?.sort(
                (a: any, b: any) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )[0];

              return (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {project.file_count} archivos •{" "}
                      {project.total_lines?.toLocaleString()} líneas
                    </div>
                  </div>
                  <div>
                    {latestAnalysis && (
                      <Badge variant="outline">
                        {latestAnalysis.overall_score}/10
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
