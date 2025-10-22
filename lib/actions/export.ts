"use server";

import { createClient } from "@/lib/supabase/server";

export async function exportAnalysisJSON(projectId: string) {
  const supabase = await createClient();

  // Get project data
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    throw new Error("Proyecto no encontrado");
  }

  // Get analysis data
  const { data: analysis, error: analysisError } = await supabase
    .from("analyses")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (analysisError || !analysis) {
    throw new Error("Análisis no encontrado");
  }

  // Get issues
  const { data: issues, error: issuesError } = await supabase
    .from("issues")
    .select("*")
    .eq("analysis_id", analysis.id)
    .order("severity", { ascending: true });

  if (issuesError) {
    throw new Error("Error al obtener problemas");
  }

  // Get valuation
  const { data: valuation, error: valuationError } = await supabase
    .from("valuations")
    .select("*")
    .eq("analysis_id", analysis.id)
    .single();

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
  };

  return exportData;
}

export async function exportAnalysisCSV(projectId: string) {
  const supabase = await createClient();

  // Get issues for CSV export
  const { data: analysis } = await supabase
    .from("analyses")
    .select("id")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!analysis) {
    throw new Error("Análisis no encontrado");
  }

  const { data: issues, error } = await supabase
    .from("issues")
    .select("*")
    .eq("analysis_id", analysis.id)
    .order("severity", { ascending: true });

  if (error || !issues) {
    throw new Error("Error al obtener problemas");
  }

  // Convert to CSV format
  const headers = [
    "Categoría",
    "Severidad",
    "Título",
    "Descripción",
    "Archivo",
    "Línea",
    "Estado",
  ];

  const rows = issues.map((issue) => [
    issue.category,
    issue.severity,
    issue.title,
    issue.description,
    issue.file_path || "N/A",
    issue.line_number?.toString() || "N/A",
    issue.status,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return csvContent;
}

export async function exportAnalysisMarkdown(
  projectId: string
): Promise<string> {
  const supabase = await createClient();

  // Get project data
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    throw new Error("Proyecto no encontrado");
  }

  // Get analysis data
  const { data: analysis, error: analysisError } = await supabase
    .from("analyses")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (analysisError || !analysis) {
    throw new Error("Análisis no encontrado");
  }

  // Get issues
  const { data: issues } = await supabase
    .from("issues")
    .select("*")
    .eq("analysis_id", analysis.id)
    .order("severity", { ascending: true });

  // Get valuation
  const { data: valuation } = await supabase
    .from("valuations")
    .select("*")
    .eq("analysis_id", analysis.id)
    .single();

  // Build Markdown content
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getSeverityEmoji = (severity: string) => {
    switch (severity) {
      case "critical":
        return "🔴";
      case "high":
        return "🟠";
      case "medium":
        return "🟡";
      case "low":
        return "🔵";
      case "info":
        return "ℹ️";
      default:
        return "⚪";
    }
  };

  const getScoreRating = (score: number) => {
    if (score >= 8) return "Excelente";
    if (score >= 6) return "Bueno";
    if (score >= 4) return "Aceptable";
    return "Necesita Mejoras";
  };

  let markdown = `# 📊 Auditoría de Software: ${project.name}

**Fecha del Reporte:** ${formatDate(new Date().toISOString())}  
**Estado:** ${project.status === "completed" ? "✅ Completado" : project.status}

---

## 📈 Resumen Ejecutivo

- **Puntuación General:** ${analysis.overall_score}/10 (${getScoreRating(
    analysis.overall_score
  )})
- **Nivel de Confianza:** ${Math.round(analysis.confidence_level * 100)}%
- **Archivos Analizados:** ${project.file_count || 0}
- **Líneas de Código:** ${(project.total_lines || 0).toLocaleString()}
- **Fecha de Análisis:** ${formatDate(analysis.created_at)}
- **Duración del Análisis:** ${analysis.analysis_duration_seconds}s
- **Modelo IA Utilizado:** ${analysis.ai_model || "claude-sonnet-4-5"}

### 📝 Resumen

${analysis.summary}

`;

  if (project.description) {
    markdown += `
### 📋 Descripción del Proyecto

${project.description}

`;
  }

  markdown += `---

## 🎯 Puntuaciones Detalladas

| Categoría | Puntuación | Evaluación |
|-----------|------------|------------|
| 🛡️ Seguridad | ${analysis.security_score}/10 | ${getScoreRating(
    analysis.security_score
  )} |
| ✨ Calidad de Código | ${analysis.code_quality_score}/10 | ${getScoreRating(
    analysis.code_quality_score
  )} |
| ⚡ Rendimiento | ${analysis.performance_score}/10 | ${getScoreRating(
    analysis.performance_score
  )} |
| 🐛 Detección de Bugs | ${analysis.bugs_score}/10 | ${getScoreRating(
    analysis.bugs_score
  )} |
| 🔧 Mantenibilidad | ${analysis.maintainability_score}/10 | ${getScoreRating(
    analysis.maintainability_score
  )} |
| 🏗️ Arquitectura | ${analysis.architecture_score}/10 | ${getScoreRating(
    analysis.architecture_score
  )} |

`;

  if (valuation) {
    markdown += `---

## 💰 Valoración del Proyecto

**Valor Estimado:** ${formatCurrency(valuation.estimated_value || 0)}  
**Rango de Valor:** ${formatCurrency(
      valuation.min_value || 0
    )} - ${formatCurrency(valuation.max_value || 0)}  
**Clasificación:** ${
      valuation.is_asset_or_liability === "asset" ? "✅ Activo" : "⚠️ Pasivo"
    }

### 💵 Desglose de Costos

`;

    if (valuation.cost_breakdown) {
      const breakdown =
        typeof valuation.cost_breakdown === "string"
          ? JSON.parse(valuation.cost_breakdown)
          : valuation.cost_breakdown;

      markdown += `- **Costo de Reconstrucción:** ${formatCurrency(
        breakdown.reconstructionCost || 0
      )}
- **Horas de Desarrollo Estimadas:** ${(
        breakdown.developmentHours || 0
      ).toLocaleString()} hrs
- **Tarifa Promedio por Hora:** ${formatCurrency(
        breakdown.averageHourlyRate || 0
      )}
- **Región:** ${breakdown.region || "N/A"}

`;
    }

    markdown += `### 📊 Costos Anuales

`;

    if (valuation.annual_costs) {
      const costs =
        typeof valuation.annual_costs === "string"
          ? JSON.parse(valuation.annual_costs)
          : valuation.annual_costs;

      markdown += `- **Mantenimiento Anual:** ${formatCurrency(
        costs.maintenance || 0
      )}
- **Infraestructura Anual:** ${formatCurrency(costs.infrastructure || 0)}
- **Remediación de Deuda Técnica:** ${formatCurrency(
        costs.technicalDebtRemediation || 0
      )}

`;
    }

    if (valuation.depreciation_factors) {
      const factors =
        typeof valuation.depreciation_factors === "string"
          ? JSON.parse(valuation.depreciation_factors)
          : valuation.depreciation_factors;

      markdown += `### 📉 Factores de Depreciación

- **Depreciación por Edad:** ${formatCurrency(factors.ageDepreciation || 0)}
- **Deuda Técnica:** ${formatCurrency(factors.technicalDebt || 0)}
- **Factor de Obsolescencia:** ${(factors.obsolescenceFactor || 0).toFixed(2)}
- **Multiplicador de Calidad:** ${(factors.qualityMultiplier || 0).toFixed(2)}x

`;
    }

    markdown += `### 📈 Metodología de Valoración

${
  valuation.methodology ||
  "Valoración basada en análisis de código, factores de mercado y comparables."
}

`;

    if (valuation.confidence_level) {
      markdown += `**Nivel de Confianza:** ${Math.round(
        valuation.confidence_level * 100
      )}%

`;
    }
  }

  // Issues Section
  const criticalIssues = issues?.filter((i) => i.severity === "critical") || [];
  const highIssues = issues?.filter((i) => i.severity === "high") || [];
  const mediumIssues = issues?.filter((i) => i.severity === "medium") || [];
  const lowIssues = issues?.filter((i) => i.severity === "low") || [];

  markdown += `---

## 🔍 Problemas Detectados

**Total de Problemas:** ${issues?.length || 0}

- 🔴 **Críticos:** ${criticalIssues.length}
- 🟠 **Altos:** ${highIssues.length}
- 🟡 **Medios:** ${mediumIssues.length}
- 🔵 **Bajos:** ${lowIssues.length}

`;

  // Critical and High Issues
  if (criticalIssues.length > 0 || highIssues.length > 0) {
    markdown += `### 🚨 Problemas Críticos y de Alta Prioridad

`;

    const priorityIssues = [...criticalIssues, ...highIssues].slice(0, 20);

    priorityIssues.forEach((issue, index) => {
      markdown += `#### ${getSeverityEmoji(issue.severity)} ${index + 1}. ${
        issue.title
      }

**Severidad:** ${issue.severity.toUpperCase()}  
**Categoría:** ${issue.category}  
**Archivo:** \`${issue.file_path || "N/A"}${
        issue.line_number ? `:${issue.line_number}` : ""
      }\`

**Descripción:**  
${issue.description}

`;

      if (issue.code_snippet) {
        markdown += `**Código:**
\`\`\`
${issue.code_snippet}
\`\`\`

`;
      }

      if (issue.suggested_fix) {
        markdown += `**Solución Sugerida:**  
${issue.suggested_fix}

`;
      }

      if (issue.impact) {
        markdown += `**Impacto:**  
${issue.impact}

`;
      }

      markdown += `---

`;
    });

    if (criticalIssues.length + highIssues.length > 20) {
      markdown += `*... y ${
        criticalIssues.length + highIssues.length - 20
      } problemas críticos/altos más*

`;
    }
  }

  // Recommendations
  if (analysis.recommendations) {
    let recommendations: any[] = [];

    try {
      recommendations =
        typeof analysis.recommendations === "string"
          ? JSON.parse(analysis.recommendations)
          : analysis.recommendations;
    } catch (e) {
      recommendations = [];
    }

    if (Array.isArray(recommendations) && recommendations.length > 0) {
      markdown += `---

## 💡 Recomendaciones

`;

      recommendations.forEach((rec, index) => {
        const title = typeof rec === "string" ? rec : rec.title || rec;
        const description = typeof rec === "object" ? rec.description : null;

        markdown += `${index + 1}. **${title}**`;

        if (description) {
          markdown += `  
   ${description}`;
        }

        markdown += `

`;
      });
    }
  }

  // Technical Information
  markdown += `---

## 📊 Información Técnica

`;

  if (project.languages && project.languages.length > 0) {
    markdown += `### 💻 Lenguajes Detectados

${project.languages.map((lang: string) => `- ${lang}`).join("\n")}

`;
  }

  if (project.github_url) {
    markdown += `### 🔗 Repositorio

[${project.github_url}](${project.github_url})

`;
  }

  markdown += `### ⚙️ Configuración del Análisis

- **Proyecto ID:** \`${project.id}\`
- **Tipo de Fuente:** ${
    project.source_type === "github" ? "GitHub" : "Archivo Subido"
  }
- **Fecha de Creación:** ${formatDate(project.created_at)}
- **Última Actualización:** ${formatDate(
    project.updated_at || project.created_at
  )}

`;

  // Footer
  markdown += `---

## 📄 Notas del Reporte

Este reporte fue generado automáticamente por el Sistema de Auditoría de Software el ${formatDate(
    new Date().toISOString()
  )}.

**Descargo de Responsabilidad:** Este análisis es una evaluación automatizada basada en IA y debe ser revisado por profesionales calificados antes de tomar decisiones críticas de negocio o técnicas.

---

*Generado con ❤️ por Software Audit AI*
`;

  return markdown;
}
