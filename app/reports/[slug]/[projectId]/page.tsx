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
  Shield,
  Code2,
  Zap,
  Bug,
  Wrench,
  Building2,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default async function ProjectReportPage({
  params,
}: {
  params: Promise<{ slug: string; projectId: string }>;
}) {
  const { slug, projectId } = await params;
  const supabase = await createClient();

  // Verify report exists and includes this project
  const { data: report } = await supabase
    .from("consolidated_reports")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (!report || !report.project_ids.includes(projectId)) {
    notFound();
  }

  // Fetch project with analysis
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (!project) {
    notFound();
  }

  // Fetch latest analysis
  const { data: analysis } = await supabase
    .from("analyses")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Fetch issues
  const { data: issues } = analysis
    ? await supabase
        .from("issues")
        .select("*")
        .eq("analysis_id", analysis.id)
        .order("severity", { ascending: true })
        .limit(10)
    : { data: null };

  // Fetch valuation
  const { data: valuation } = analysis
    ? await supabase
        .from("valuations")
        .select("*")
        .eq("analysis_id", analysis.id)
        .single()
    : { data: null };

  const getScoreRating = (score: number) => {
    if (score >= 8) return "Excelente";
    if (score >= 6) return "Bueno";
    if (score >= 4) return "Aceptable";
    return "Necesita Mejoras";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!analysis) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">{project.name}</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Este proyecto no tiene análisis completado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
        {project.description && (
          <p className="text-muted-foreground">{project.description}</p>
        )}
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle>Puntuación General</CardTitle>
          <CardDescription>
            Análisis completado el{" "}
            {new Date(analysis.created_at).toLocaleDateString("es-ES")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary">
                {analysis.overall_score}
              </div>
              <div className="text-sm text-muted-foreground">de 10</div>
              <Badge variant="outline" className="mt-2">
                {getScoreRating(analysis.overall_score)}
              </Badge>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-4">
                {analysis.summary}
              </p>
              <div className="flex items-center gap-4 text-xs">
                <span>
                  Confianza: {Math.round(analysis.confidence_level * 100)}%
                </span>
                <span>Duración: {analysis.analysis_duration_seconds}s</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart */}
      <ScoreRadarChart
        scores={{
          security: analysis.security_score,
          codeQuality: analysis.code_quality_score,
          performance: analysis.performance_score,
          bugs: analysis.bugs_score,
          maintainability: analysis.maintainability_score,
          architecture: analysis.architecture_score,
        }}
      />

      {/* Category Scores */}
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
                  {analysis.security_score}/10
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
                  {analysis.code_quality_score}/10
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
                  {analysis.performance_score}/10
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
                  {analysis.bugs_score}/10
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
                  {analysis.maintainability_score}/10
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
                  {analysis.architecture_score}/10
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Valuation */}
      {valuation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Valoración del Proyecto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">
                  Valor Estimado
                </div>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(valuation.estimated_value || 0)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Rango de Valor
                </div>
                <div className="text-lg font-semibold">
                  {formatCurrency(valuation.min_value || 0)} -{" "}
                  {formatCurrency(valuation.max_value || 0)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Clasificación
                </div>
                <Badge
                  variant={
                    valuation.is_asset_or_liability === "asset"
                      ? "default"
                      : "secondary"
                  }
                  className="mt-1"
                >
                  {valuation.is_asset_or_liability === "asset"
                    ? "Activo"
                    : "Pasivo"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Issues */}
      {issues && issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Top 10 Problemas Detectados
            </CardTitle>
            <CardDescription>
              Los problemas más críticos encontrados en el análisis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {issues.map((issue: any) => (
                <div
                  key={issue.id}
                  className="border-l-4 border-primary pl-4 py-2"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{issue.title}</h4>
                    <Badge
                      variant={
                        issue.severity === "critical"
                          ? "destructive"
                          : issue.severity === "high"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {issue.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {issue.description}
                  </p>
                  {issue.file_path && (
                    <p className="text-xs text-muted-foreground">
                      {issue.file_path}
                      {issue.line_number && `:${issue.line_number}`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">
                Archivos Analizados
              </div>
              <div className="text-lg font-semibold">{project.file_count}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Líneas de Código
              </div>
              <div className="text-lg font-semibold">
                {project.total_lines?.toLocaleString()}
              </div>
            </div>
            {project.languages && project.languages.length > 0 && (
              <div className="md:col-span-2">
                <div className="text-sm text-muted-foreground mb-2">
                  Lenguajes
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.languages.map((lang: string) => (
                    <Badge key={lang} variant="secondary">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
