"use server";

import { createClient } from "@/lib/supabase/server";

interface ExportReportOptions {
  slug: string;
  format: "markdown" | "text";
}

export async function exportConsolidatedReport({
  slug,
  format,
}: ExportReportOptions) {
  const supabase = await createClient();

  // Fetch report
  const { data: report, error: reportError } = await supabase
    .from("consolidated_reports")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (reportError || !report) {
    return { error: "Reporte no encontrado" };
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
        confidence_level,
        summary,
        recommendations,
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
    .select("*")
    .in("analysis_id", analysisIds);

  // Fetch all valuations
  const { data: allValuations } = await supabase
    .from("valuations")
    .select("*")
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (format === "markdown") {
    return {
      success: true,
      content: generateMarkdown({
        report,
        projects,
        projectCount,
        totalFiles,
        totalLines,
        allLanguages,
        avgOverallScore,
        avgScores,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        totalEstimatedValue,
        totalMinValue,
        totalMaxValue,
        allIssues,
        allValuations,
        formatCurrency,
        formatDate,
      }),
      filename: `reporte-consolidado-${slug}.md`,
    };
  } else {
    return {
      success: true,
      content: generatePlainText({
        report,
        projects,
        projectCount,
        totalFiles,
        totalLines,
        allLanguages,
        avgOverallScore,
        avgScores,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        totalEstimatedValue,
        totalMinValue,
        totalMaxValue,
        allIssues,
        allValuations,
        formatCurrency,
        formatDate,
      }),
      filename: `reporte-consolidado-${slug}.txt`,
    };
  }
}

function generateMarkdown(data: any): string {
  const {
    report,
    projects,
    projectCount,
    totalFiles,
    totalLines,
    allLanguages,
    avgOverallScore,
    avgScores,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    totalEstimatedValue,
    totalMinValue,
    totalMaxValue,
    formatCurrency,
    formatDate,
  } = data;

  let markdown = `# ${report.title || "Reporte Consolidado de Auditoría"}\n\n`;
  markdown += `${
    report.description || `Análisis consolidado de ${projectCount} proyecto(s)`
  }\n\n`;
  markdown += `**Generado el:** ${formatDate(report.created_at)}\n\n`;
  markdown += `---\n\n`;

  // Executive Summary
  markdown += `## Resumen Ejecutivo\n\n`;
  markdown += `| Métrica | Valor |\n`;
  markdown += `|---------|-------|\n`;
  markdown += `| **Puntuación Promedio** | ${avgOverallScore.toFixed(
    1
  )}/10 |\n`;
  markdown += `| **Proyectos Analizados** | ${projectCount} |\n`;
  markdown += `| **Archivos Totales** | ${totalFiles.toLocaleString()} |\n`;
  markdown += `| **Líneas de Código** | ${totalLines.toLocaleString()} |\n`;
  markdown += `| **Valor Estimado Total** | ${formatCurrency(
    totalEstimatedValue
  )} |\n`;
  markdown += `| **Rango de Valor** | ${formatCurrency(
    totalMinValue
  )} - ${formatCurrency(totalMaxValue)} |\n\n`;

  // Average Scores
  markdown += `## Puntuaciones Promedio por Categoría\n\n`;
  markdown += `| Categoría | Puntuación |\n`;
  markdown += `|-----------|------------|\n`;
  markdown += `| 🛡️ Seguridad | ${avgScores.security.toFixed(1)}/10 |\n`;
  markdown += `| 💎 Calidad de Código | ${avgScores.codeQuality.toFixed(
    1
  )}/10 |\n`;
  markdown += `| ⚡ Rendimiento | ${avgScores.performance.toFixed(1)}/10 |\n`;
  markdown += `| 🐛 Detección de Bugs | ${avgScores.bugs.toFixed(1)}/10 |\n`;
  markdown += `| 🔧 Mantenibilidad | ${avgScores.maintainability.toFixed(
    1
  )}/10 |\n`;
  markdown += `| 🏗️ Arquitectura | ${avgScores.architecture.toFixed(
    1
  )}/10 |\n\n`;

  // Issues Summary
  markdown += `## Problemas Detectados\n\n`;
  markdown += `| Severidad | Cantidad |\n`;
  markdown += `|-----------|----------|\n`;
  markdown += `| 🔴 Críticos | ${criticalCount} |\n`;
  markdown += `| 🟠 Altos | ${highCount} |\n`;
  markdown += `| 🟡 Medios | ${mediumCount} |\n`;
  markdown += `| 🔵 Bajos | ${lowCount} |\n\n`;

  // Languages
  if (allLanguages.length > 0) {
    markdown += `## Lenguajes Detectados\n\n`;
    markdown += allLanguages.map((lang: string) => `- ${lang}`).join("\n");
    markdown += `\n\n`;
  }

  // Projects List
  markdown += `## Proyectos Incluidos\n\n`;
  projects?.forEach((project: any) => {
    const latestAnalysis = project.analyses?.sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    markdown += `### ${project.name}\n\n`;
    if (project.description) {
      markdown += `${project.description}\n\n`;
    }
    markdown += `- **Archivos:** ${project.file_count}\n`;
    markdown += `- **Líneas:** ${project.total_lines?.toLocaleString()}\n`;
    if (latestAnalysis) {
      markdown += `- **Puntuación:** ${latestAnalysis.overall_score}/10\n`;
      markdown += `- **Análisis:** ${formatDate(
        latestAnalysis.created_at
      )}\n\n`;
      if (latestAnalysis.summary) {
        markdown += `**Resumen:** ${latestAnalysis.summary}\n\n`;
      }
    }
    markdown += `\n`;
  });

  // Methodology
  markdown += `---\n\n`;
  markdown += `## Metodología de Auditoría\n\n`;
  markdown += `### Enfoque de Análisis\n\n`;
  markdown += `El sistema utiliza IA avanzada para analizar el código fuente en múltiples categorías:\n\n`;
  markdown += `1. **Seguridad:** Vulnerabilidades, exposición de datos, autenticación\n`;
  markdown += `2. **Calidad de Código:** Complejidad, duplicación, estándares\n`;
  markdown += `3. **Rendimiento:** Eficiencia algorítmica, uso de recursos\n`;
  markdown += `4. **Bugs:** Errores lógicos, casos edge, manejo de errores\n`;
  markdown += `5. **Mantenibilidad:** Documentación, testabilidad, modularidad\n`;
  markdown += `6. **Arquitectura:** Patrones de diseño, escalabilidad, separación\n\n`;

  markdown += `### Fórmula de Puntuación\n\n`;
  markdown += `\`\`\`\n`;
  markdown += `Puntuación General = (Seguridad + Calidad + Rendimiento + Bugs + Mantenibilidad + Arquitectura) / 6\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `### Escala de Puntuación\n\n`;
  markdown += `- **8-10:** Excelente\n`;
  markdown += `- **6-7.9:** Bueno\n`;
  markdown += `- **4-5.9:** Aceptable\n`;
  markdown += `- **0-3.9:** Necesita Mejoras\n\n`;

  markdown += `---\n\n`;
  markdown += `*Reporte generado con AuditCode AI*\n`;

  return markdown;
}

function generatePlainText(data: any): string {
  const {
    report,
    projects,
    projectCount,
    totalFiles,
    totalLines,
    allLanguages,
    avgOverallScore,
    avgScores,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    totalEstimatedValue,
    totalMinValue,
    totalMaxValue,
    formatCurrency,
    formatDate,
  } = data;

  let text = `${report.title || "REPORTE CONSOLIDADO DE AUDITORÍA"}\n`;
  text += `${"=".repeat(70)}\n\n`;
  text += `${
    report.description || `Análisis consolidado de ${projectCount} proyecto(s)`
  }\n`;
  text += `Generado el: ${formatDate(report.created_at)}\n\n`;
  text += `${"-".repeat(70)}\n\n`;

  // Executive Summary
  text += `RESUMEN EJECUTIVO\n`;
  text += `${"-".repeat(70)}\n\n`;
  text += `Puntuación Promedio:     ${avgOverallScore.toFixed(1)}/10\n`;
  text += `Proyectos Analizados:    ${projectCount}\n`;
  text += `Archivos Totales:        ${totalFiles.toLocaleString()}\n`;
  text += `Líneas de Código:        ${totalLines.toLocaleString()}\n`;
  text += `Valor Estimado Total:    ${formatCurrency(totalEstimatedValue)}\n`;
  text += `Rango de Valor:          ${formatCurrency(
    totalMinValue
  )} - ${formatCurrency(totalMaxValue)}\n\n`;
  text += `${"-".repeat(70)}\n\n`;

  // Average Scores
  text += `PUNTUACIONES PROMEDIO POR CATEGORÍA\n`;
  text += `${"-".repeat(70)}\n\n`;
  text += `Seguridad:               ${avgScores.security.toFixed(1)}/10\n`;
  text += `Calidad de Código:       ${avgScores.codeQuality.toFixed(1)}/10\n`;
  text += `Rendimiento:             ${avgScores.performance.toFixed(1)}/10\n`;
  text += `Detección de Bugs:       ${avgScores.bugs.toFixed(1)}/10\n`;
  text += `Mantenibilidad:          ${avgScores.maintainability.toFixed(
    1
  )}/10\n`;
  text += `Arquitectura:            ${avgScores.architecture.toFixed(
    1
  )}/10\n\n`;
  text += `${"-".repeat(70)}\n\n`;

  // Issues Summary
  text += `PROBLEMAS DETECTADOS\n`;
  text += `${"-".repeat(70)}\n\n`;
  text += `Críticos:                ${criticalCount}\n`;
  text += `Altos:                   ${highCount}\n`;
  text += `Medios:                  ${mediumCount}\n`;
  text += `Bajos:                   ${lowCount}\n\n`;
  text += `${"-".repeat(70)}\n\n`;

  // Languages
  if (allLanguages.length > 0) {
    text += `LENGUAJES DETECTADOS\n`;
    text += `${"-".repeat(70)}\n\n`;
    text += allLanguages.join(", ");
    text += `\n\n${"-".repeat(70)}\n\n`;
  }

  // Projects List
  text += `PROYECTOS INCLUIDOS\n`;
  text += `${"-".repeat(70)}\n\n`;
  projects?.forEach((project: any, index: number) => {
    const latestAnalysis = project.analyses?.sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    text += `${index + 1}. ${project.name}\n`;
    if (project.description) {
      text += `   ${project.description}\n`;
    }
    text += `   Archivos: ${project.file_count}\n`;
    text += `   Líneas: ${project.total_lines?.toLocaleString()}\n`;
    if (latestAnalysis) {
      text += `   Puntuación: ${latestAnalysis.overall_score}/10\n`;
      text += `   Análisis: ${formatDate(latestAnalysis.created_at)}\n`;
      if (latestAnalysis.summary) {
        text += `   Resumen: ${latestAnalysis.summary}\n`;
      }
    }
    text += `\n`;
  });
  text += `${"-".repeat(70)}\n\n`;

  // Methodology
  text += `METODOLOGÍA DE AUDITORÍA\n`;
  text += `${"-".repeat(70)}\n\n`;
  text += `ENFOQUE DE ANÁLISIS\n\n`;
  text += `El sistema utiliza IA avanzada para analizar el código fuente en\n`;
  text += `múltiples categorías:\n\n`;
  text += `1. Seguridad: Vulnerabilidades, exposición de datos, autenticación\n`;
  text += `2. Calidad de Código: Complejidad, duplicación, estándares\n`;
  text += `3. Rendimiento: Eficiencia algorítmica, uso de recursos\n`;
  text += `4. Bugs: Errores lógicos, casos edge, manejo de errores\n`;
  text += `5. Mantenibilidad: Documentación, testabilidad, modularidad\n`;
  text += `6. Arquitectura: Patrones de diseño, escalabilidad, separación\n\n`;

  text += `FÓRMULA DE PUNTUACIÓN\n\n`;
  text += `Puntuación General = (Seguridad + Calidad + Rendimiento + Bugs +\n`;
  text += `                      Mantenibilidad + Arquitectura) / 6\n\n`;

  text += `ESCALA DE PUNTUACIÓN\n\n`;
  text += `8-10:   Excelente\n`;
  text += `6-7.9:  Bueno\n`;
  text += `4-5.9:  Aceptable\n`;
  text += `0-3.9:  Necesita Mejoras\n\n`;

  text += `${"-".repeat(70)}\n`;
  text += `Reporte generado con AuditCode AI\n`;
  text += `${"-".repeat(70)}\n`;

  return text;
}
