"use server"

import { createClient } from "@/lib/supabase/server"

export async function exportAnalysisJSON(projectId: string) {
  const supabase = await createClient()

  // Get project data
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single()

  if (projectError || !project) {
    throw new Error("Proyecto no encontrado")
  }

  // Get analysis data
  const { data: analysis, error: analysisError } = await supabase
    .from("analyses")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (analysisError || !analysis) {
    throw new Error("Análisis no encontrado")
  }

  // Get issues
  const { data: issues, error: issuesError } = await supabase
    .from("issues")
    .select("*")
    .eq("analysis_id", analysis.id)
    .order("severity", { ascending: true })

  if (issuesError) {
    throw new Error("Error al obtener problemas")
  }

  // Get valuation
  const { data: valuation, error: valuationError } = await supabase
    .from("valuations")
    .select("*")
    .eq("analysis_id", analysis.id)
    .single()

  // Compile export data
  const exportData = {
    project: {
      name: project.name,
      description: project.description,
      language: project.language,
      total_files: project.total_files,
      total_lines: project.total_lines,
      created_at: project.created_at,
    },
    analysis: {
      overall_score: analysis.overall_score,
      security_score: analysis.security_score,
      code_quality_score: analysis.code_quality_score,
      performance_score: analysis.performance_score,
      bugs_score: analysis.bugs_score,
      maintainability_score: analysis.maintainability_score,
      architecture_score: analysis.architecture_score,
      summary: analysis.summary,
      analyzed_at: analysis.created_at,
    },
    issues: issues || [],
    valuation: valuation
      ? {
          estimated_value: valuation.estimated_value,
          development_cost: valuation.development_cost,
          maintenance_cost: valuation.maintenance_cost,
          infrastructure_cost: valuation.infrastructure_cost,
          confidence_score: valuation.confidence_score,
          methodology: valuation.methodology,
          comparable_projects: valuation.comparable_projects,
        }
      : null,
    exported_at: new Date().toISOString(),
  }

  return exportData
}

export async function exportAnalysisCSV(projectId: string) {
  const supabase = await createClient()

  // Get issues for CSV export
  const { data: analysis } = await supabase
    .from("analyses")
    .select("id")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (!analysis) {
    throw new Error("Análisis no encontrado")
  }

  const { data: issues, error } = await supabase
    .from("issues")
    .select("*")
    .eq("analysis_id", analysis.id)
    .order("severity", { ascending: true })

  if (error || !issues) {
    throw new Error("Error al obtener problemas")
  }

  // Convert to CSV format
  const headers = ["Categoría", "Severidad", "Título", "Descripción", "Archivo", "Línea", "Estado"]

  const rows = issues.map((issue) => [
    issue.category,
    issue.severity,
    issue.title,
    issue.description,
    issue.file_path || "N/A",
    issue.line_number?.toString() || "N/A",
    issue.status,
  ])

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
  ].join("\n")

  return csvContent
}
