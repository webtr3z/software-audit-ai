"use server";

import { createClient } from "@/lib/supabase/server";
import { analyzeCodeComplete, type CodeFile } from "@/lib/ai/analyzer";
import {
  calculateOverallScore,
  calculateConfidenceLevel,
  generateSummary,
} from "@/lib/ai/scoring";
import {
  calculateValuation,
  calculateBasicValuation,
} from "@/lib/ai/valuation";
import { revalidatePath } from "next/cache";
import { analysisStatusManager } from "@/lib/analysis-status-manager";

export async function startAnalysis(projectId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  try {
    // Get project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return { error: "Proyecto no encontrado" };
    }

    // Use project configuration with fallback
    const selectedModel = project.ai_model || "claude-sonnet-4-5-20250929";
    const maxTokens = project.max_tokens || 16384;
    const temperature = project.temperature || 1.0;
    const retryAttempts = project.analysis_config?.retry_attempts || 2;

    console.log(`[v0] Starting analysis with configuration:`, {
      model: selectedModel,
      maxTokens,
      temperature,
      retryAttempts,
    });

    // Update status to analyzing
    await supabase
      .from("projects")
      .update({ status: "analyzing" })
      .eq("id", projectId);

    revalidatePath(`/dashboard/projects/${projectId}`);

    // Emit initial status
    analysisStatusManager.emit(
      projectId,
      `Iniciando análisis con modelo ${selectedModel}...`,
      "starting"
    );

    // For now, we'll create mock files since we don't have actual file storage
    // In a real implementation, you would fetch the actual uploaded files
    const mockFiles: CodeFile[] = [
      {
        path: "src/index.js",
        content: `// Código de ejemplo para análisis
function getUserData(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId; // SQL Injection vulnerability
  return db.query(query);
}

function processPayment(amount) {
  if (amount > 0) { // Missing validation for maximum amount
    return payment.process(amount);
  }
}`,
        language: "JavaScript",
      },
    ];

    console.log("[v0] Starting AI analysis...");
    const startTime = Date.now();

    analysisStatusManager.emit(
      projectId,
      `Analizando ${mockFiles.length} archivos del proyecto...`,
      "preparing"
    );

    // Run complete analysis with selected model and configuration
    const results = await analyzeCodeComplete(
      mockFiles,
      selectedModel,
      projectId,
      {
        maxTokens,
        temperature,
        retryAttempts,
      }
    );

    const analysisTime = Math.round((Date.now() - startTime) / 1000);

    console.log("[v0] Analysis complete in", analysisTime, "seconds");

    analysisStatusManager.emit(
      projectId,
      "Análisis de código completado. Calculando puntuaciones...",
      "scoring"
    );

    // Calculate scores
    const scores = {
      security: results.security.score,
      code_quality: results.code_quality.score,
      performance: results.performance.score,
      bugs: results.bugs.score,
      maintainability: results.maintainability.score,
      architecture: results.architecture.score,
    };

    const overallScore = calculateOverallScore(scores);
    const confidenceLevel = calculateConfidenceLevel(
      results,
      project.file_count,
      project.total_lines
    );
    const summary = generateSummary(scores, overallScore, results);

    // Collect all recommendations
    const allRecommendations = [
      ...results.security.recommendations,
      ...results.code_quality.recommendations,
      ...results.performance.recommendations,
      ...results.bugs.recommendations,
      ...results.maintainability.recommendations,
      ...results.architecture.recommendations,
    ];

    // Create analysis record
    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .insert({
        project_id: projectId,
        user_id: user.id,
        overall_score: overallScore,
        security_score: scores.security,
        code_quality_score: scores.code_quality,
        performance_score: scores.performance,
        bugs_score: scores.bugs,
        maintainability_score: scores.maintainability,
        architecture_score: scores.architecture,
        analysis_duration_seconds: analysisTime,
        ai_model: selectedModel,
        confidence_level: confidenceLevel,
        summary,
        recommendations: allRecommendations,
      })
      .select()
      .single();

    if (analysisError) throw analysisError;

    // Insert all issues
    const allIssues = [
      ...results.security.issues.map((issue) => ({
        ...issue,
        category: "security",
      })),
      ...results.code_quality.issues.map((issue) => ({
        ...issue,
        category: "code_quality",
      })),
      ...results.performance.issues.map((issue) => ({
        ...issue,
        category: "performance",
      })),
      ...results.bugs.issues.map((issue) => ({ ...issue, category: "bug" })),
      ...results.maintainability.issues.map((issue) => ({
        ...issue,
        category: "maintainability",
      })),
      ...results.architecture.issues.map((issue) => ({
        ...issue,
        category: "architecture",
      })),
    ];

    if (allIssues.length > 0) {
      const issuesData = allIssues.map((issue) => ({
        analysis_id: analysis.id,
        project_id: projectId,
        user_id: user.id,
        category: issue.category,
        severity: issue.severity,
        title: issue.title,
        description: issue.description,
        file_path: issue.file_path || null,
        line_number: issue.line_number || null,
        code_snippet: issue.code_snippet || null,
        suggested_fix: issue.suggested_fix || null,
        auto_fixable: false,
        status: "open",
      }));

      const { error: issuesError } = await supabase
        .from("issues")
        .insert(issuesData);

      if (issuesError) {
        console.error("[v0] Error inserting issues:", issuesError);
      }
    }

    console.log("[v0] Starting valuation calculation...");
    analysisStatusManager.emit(
      projectId,
      "Calculando valoración monetaria del proyecto...",
      "valuation"
    );

    try {
      const valuationResult = await calculateValuation({
        projectName: project.name,
        description: project.description,
        fileCount: project.file_count,
        totalLines: project.total_lines,
        languages: project.languages || [],
        overallScore,
        securityScore: scores.security,
        codeQualityScore: scores.code_quality,
        performanceScore: scores.performance,
        bugsScore: scores.bugs,
        maintainabilityScore: scores.maintainability,
        architectureScore: scores.architecture,
      });

      // Insert valuation record with new comprehensive structure
      const { error: valuationError } = await supabase
        .from("valuations")
        .insert({
          analysis_id: analysis.id,
          project_id: projectId,
          user_id: user.id,
          estimated_value: valuationResult.estimatedValue,
          min_value: valuationResult.minValue,
          max_value: valuationResult.maxValue,
          is_asset_or_liability: valuationResult.isAssetOrLiability,

          // New comprehensive fields
          cost_breakdown: valuationResult.costBreakdown,
          depreciation_factors: valuationResult.depreciationFactors,
          value_increments: valuationResult.valueIncrements,
          annual_costs: valuationResult.annualCosts,
          quality_metrics: valuationResult.qualityMetrics,
          risk_factors: valuationResult.riskFactors,
          assumptions: valuationResult.assumptions,
          recommendations: valuationResult.recommendations,

          // Legacy fields for backward compatibility
          development_cost: valuationResult.costBreakdown.reconstructionCost,
          maintenance_cost: valuationResult.annualCosts.maintenance,
          infrastructure_cost: valuationResult.annualCosts.infrastructure,
          complexity_factor: 1.0,
          quality_factor: valuationResult.depreciationFactors.qualityMultiplier,
          market_factor: 1.0,

          confidence_level: valuationResult.confidenceLevel,
          methodology: valuationResult.methodology,
          comparable_projects: valuationResult.comparableProjects,
          notes: valuationResult.notes,
        });

      if (valuationError) {
        console.error("[v0] Error inserting valuation:", valuationError);
      } else {
        console.log("[v0] Valuation completed successfully");
      }
    } catch (valuationError) {
      console.error(
        "[v0] Error in valuation, using basic calculation:",
        valuationError
      );

      // Fallback to basic valuation
      const basicValuation = calculateBasicValuation({
        projectName: project.name,
        description: project.description,
        fileCount: project.file_count,
        totalLines: project.total_lines,
        languages: project.languages || [],
        overallScore,
        securityScore: scores.security,
        codeQualityScore: scores.code_quality,
        performanceScore: scores.performance,
        bugsScore: scores.bugs,
        maintainabilityScore: scores.maintainability,
        architectureScore: scores.architecture,
      });

      await supabase.from("valuations").insert({
        analysis_id: analysis.id,
        project_id: projectId,
        user_id: user.id,
        estimated_value: basicValuation.estimatedValue,
        min_value: basicValuation.minValue,
        max_value: basicValuation.maxValue,
        is_asset_or_liability: basicValuation.isAssetOrLiability,

        // New comprehensive fields
        cost_breakdown: basicValuation.costBreakdown,
        depreciation_factors: basicValuation.depreciationFactors,
        value_increments: basicValuation.valueIncrements,
        annual_costs: basicValuation.annualCosts,
        quality_metrics: basicValuation.qualityMetrics,
        risk_factors: basicValuation.riskFactors,
        assumptions: basicValuation.assumptions,
        recommendations: basicValuation.recommendations,

        // Legacy fields for backward compatibility
        development_cost: basicValuation.costBreakdown.reconstructionCost,
        maintenance_cost: basicValuation.annualCosts.maintenance,
        infrastructure_cost: basicValuation.annualCosts.infrastructure,
        complexity_factor: 1.0,
        quality_factor: basicValuation.depreciationFactors.qualityMultiplier,
        market_factor: 1.0,

        confidence_level: basicValuation.confidenceLevel,
        methodology: basicValuation.methodology,
        comparable_projects: basicValuation.comparableProjects,
        notes: basicValuation.notes,
      });
    }
    // </CHANGE>

    // Update project status to completed
    await supabase
      .from("projects")
      .update({ status: "completed" })
      .eq("id", projectId);

    revalidatePath(`/dashboard/projects/${projectId}`);

    analysisStatusManager.emit(
      projectId,
      "¡Análisis completado exitosamente!",
      "completed"
    );

    return { success: true, analysisId: analysis.id };
  } catch (error) {
    console.error("[v0] Error in analysis:", error);

    analysisStatusManager.emit(
      projectId,
      `Error durante el análisis: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
      "failed"
    );

    // Update project status to failed
    await supabase
      .from("projects")
      .update({ status: "failed" })
      .eq("id", projectId);

    revalidatePath(`/dashboard/projects/${projectId}`);

    return { error: "Error al analizar el proyecto" };
  }
}
