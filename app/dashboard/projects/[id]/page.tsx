import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Github,
  Upload,
  Shield,
  Code2,
  Zap,
  Bug,
  Wrench,
  Building2,
  DollarSign,
  TrendingUp,
  FileText,
} from "lucide-react";
import { DeleteProjectButton } from "@/components/delete-project-button";
import { StartAnalysisButton } from "@/components/start-analysis-button";
import { ScoreRadarChart } from "@/components/score-radar-chart";
import { ExportButtons } from "@/components/export-buttons";
import { FixSuggestionDialog } from "@/components/fix-suggestion-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModelConfigForm } from "@/components/model-config-form";
import { ComprehensiveValuationDisplay } from "@/components/comprehensive-valuation-display";
import { PromptEditor } from "@/components/prompt-editor";
import { getAllUserPrompts } from "@/lib/ai/prompt-service";
import { Settings } from "lucide-react";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch project
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !project) {
    notFound();
  }

  // Fetch latest analysis if exists
  const { data: analysis } = await supabase
    .from("analyses")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Fetch issues if analysis exists
  const { data: issues } = analysis
    ? await supabase
        .from("issues")
        .select("*")
        .eq("analysis_id", analysis.id)
        .order("severity", { ascending: true })
    : { data: null };

  const { data: valuation } = analysis
    ? await supabase
        .from("valuations")
        .select("*")
        .eq("analysis_id", analysis.id)
        .single()
    : { data: null };

  const criticalIssues =
    issues?.filter((i) => i.severity === "critical").length || 0;
  const highIssues = issues?.filter((i) => i.severity === "high").length || 0;

  // Fetch user prompts for prompt editor
  const userPrompts = await getAllUserPrompts(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold">{project.name}</h2>
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
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {analysis && (
            <ExportButtons projectId={project.id} projectName={project.name} />
          )}
          <DeleteProjectButton
            projectId={project.id}
            projectName={project.name}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Origen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {project.source_type === "github" ? (
                <>
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">GitHub</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Subido</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Archivos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.file_count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Líneas de Código</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.total_lines?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Creado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold">
              {new Date(project.created_at).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="config">
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {analysis && (
            <>
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
                      <div className="text-5xl font-bold text-primary">
                        {analysis.overall_score}
                      </div>
                      <div className="text-sm text-muted-foreground">de 10</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2">
                        {analysis.summary}
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <span>
                          Confianza:{" "}
                          {Math.round(analysis.confidence_level * 100)}%
                        </span>
                        <span>
                          Duración: {analysis.analysis_duration_seconds}s
                        </span>
                        {criticalIssues > 0 && (
                          <Badge variant="destructive" className="gap-1">
                            {criticalIssues} crítico(s)
                          </Badge>
                        )}
                        {highIssues > 0 && (
                          <Badge variant="secondary" className="gap-1">
                            {highIssues} alto(s)
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
              {/* </CHANGE> */}

              {valuation && (
                <ComprehensiveValuationDisplay valuation={valuation} />
              )}

              {/* Category Scores */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground">
                          Seguridad
                        </div>
                        <div className="text-2xl font-bold">
                          {analysis.security_score}/10
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
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
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground">
                          Rendimiento
                        </div>
                        <div className="text-2xl font-bold">
                          {analysis.performance_score}/10
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
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
                    <div className="flex items-center gap-3 mb-2">
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
                    <div className="flex items-center gap-3 mb-2">
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

              {/* Issues Summary */}
              {issues && issues.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>
                          Problemas Detectados ({issues.length})
                        </CardTitle>
                        <CardDescription>
                          Los primeros 5 problemas más críticos
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/projects/${id}/issues`}>
                          <FileText className="h-4 w-4 mr-2" />
                          Ver Todos
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {issues.slice(0, 5).map((issue) => (
                        <div
                          key={issue.id}
                          className="border-l-4 border-primary pl-4 py-2"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-sm">
                              {issue.title}
                            </h4>
                            <div className="flex items-center gap-2">
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
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {issue.description}
                          </p>
                          {issue.file_path && (
                            <p className="text-xs text-muted-foreground mb-2">
                              {issue.file_path}
                              {issue.line_number && `:${issue.line_number}`}
                            </p>
                          )}
                          <FixSuggestionDialog
                            issue={{
                              id: issue.id,
                              title: issue.title,
                              description: issue.description,
                              category: issue.category,
                              severity: issue.severity,
                              file_path: issue.file_path,
                              line_number: issue.line_number,
                            }}
                            codeContext="// Código de ejemplo - en producción se obtendría del archivo real"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {project.languages && project.languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Lenguajes Detectados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.languages.map((lang: string) => (
                    <Badge key={lang} variant="secondary">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {project.github_url && (
            <Card>
              <CardHeader>
                <CardTitle>Repositorio de GitHub</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  {project.github_url}
                </a>
              </CardContent>
            </Card>
          )}

          {project.status === "pending" && (
            <Card>
              <CardContent className="pt-6 py-8 max-w-md mx-auto">
                <div className="text-center mb-6">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Análisis Pendiente</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Este proyecto está listo para ser analizado. Haz clic en el
                    botón para comenzar el análisis con IA.
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <StartAnalysisButton projectId={project.id} />
                </div>
              </CardContent>
            </Card>
          )}

          {project.status === "failed" && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6 py-8 max-w-md mx-auto">
                <div className="text-center mb-6">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h3 className="font-semibold mb-2 text-destructive">
                    Error en el Análisis
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ocurrió un error durante el análisis de este proyecto.
                    Puedes intentar nuevamente o verificar que el proyecto tenga
                    archivos válidos para analizar.
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <StartAnalysisButton projectId={project.id} isRetry={true} />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <ModelConfigForm
            projectId={project.id}
            currentConfig={{
              ai_model: project.ai_model,
              max_tokens: project.max_tokens,
              temperature: project.temperature,
              analysis_config: project.analysis_config,
            }}
          />

          <PromptEditor initialPrompts={userPrompts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
