import type { AnalysisResult } from "./analyzer";

export interface WeightedScores {
  security: number;
  code_quality: number;
  performance: number;
  bugs: number;
  maintainability: number;
  architecture: number;
}

// Weights for each category (must sum to 1.0)
export const CATEGORY_WEIGHTS = {
  security: 0.25, // 25% - Most important
  code_quality: 0.2, // 20%
  performance: 0.15, // 15%
  bugs: 0.2, // 20%
  maintainability: 0.1, // 10%
  architecture: 0.1, // 10%
};

export function calculateOverallScore(scores: WeightedScores): number {
  const weightedSum =
    scores.security * CATEGORY_WEIGHTS.security +
    scores.code_quality * CATEGORY_WEIGHTS.code_quality +
    scores.performance * CATEGORY_WEIGHTS.performance +
    scores.bugs * CATEGORY_WEIGHTS.bugs +
    scores.maintainability * CATEGORY_WEIGHTS.maintainability +
    scores.architecture * CATEGORY_WEIGHTS.architecture;

  // Round to 1 decimal place
  return Math.round(weightedSum * 10) / 10;
}

export function calculateConfidenceLevel(
  results: Record<string, AnalysisResult>,
  fileCount: number,
  totalLines: number
): number {
  // Base confidence on multiple factors
  let confidence = 0.8; // Start at 80%

  // Reduce confidence for very small codebases
  if (fileCount < 3) {
    confidence -= 0.1;
  }
  if (totalLines < 100) {
    confidence -= 0.1;
  }

  // Reduce confidence if any category has very few issues (might have missed something)
  const avgIssuesPerCategory =
    Object.values(results).reduce(
      (sum, result) => sum + result.issues.length,
      0
    ) / Object.keys(results).length;

  if (avgIssuesPerCategory < 2) {
    confidence -= 0.05;
  }

  // Ensure confidence is between 0 and 1
  return Math.max(0.5, Math.min(0.99, confidence));
}

export function generateSummary(
  scores: WeightedScores,
  overallScore: number,
  results: Record<string, AnalysisResult>
): string {
  const criticalIssues = Object.values(results).reduce(
    (sum, result) =>
      sum + result.issues.filter((i) => i.severity === "critical").length,
    0
  );

  const highIssues = Object.values(results).reduce(
    (sum, result) =>
      sum + result.issues.filter((i) => i.severity === "high").length,
    0
  );

  let summary = `Puntuación general: ${overallScore}/10. `;

  if (overallScore >= 8) {
    summary +=
      "El código tiene una calidad excelente con pocas áreas de mejora. ";
  } else if (overallScore >= 6) {
    summary +=
      "El código tiene una calidad buena pero hay áreas que requieren atención. ";
  } else if (overallScore >= 4) {
    summary +=
      "El código tiene una calidad moderada con varias áreas que necesitan mejoras. ";
  } else {
    summary +=
      "El código tiene problemas significativos que requieren atención inmediata. ";
  }

  if (criticalIssues > 0) {
    summary += `Se encontraron ${criticalIssues} problema(s) crítico(s) que deben resolverse urgentemente. `;
  }

  if (highIssues > 0) {
    summary += `Hay ${highIssues} problema(s) de alta prioridad. `;
  }

  // Identify weakest area
  const weakestCategory = (
    Object.entries(scores) as [keyof WeightedScores, number][]
  ).reduce(
    (min, [key, value]) => (value < scores[min] ? key : min),
    Object.keys(scores)[0] as keyof WeightedScores
  );

  const categoryNames: Record<string, string> = {
    security: "seguridad",
    code_quality: "calidad de código",
    performance: "rendimiento",
    bugs: "detección de bugs",
    maintainability: "mantenibilidad",
    architecture: "arquitectura",
  };

  summary += `El área más débil es ${categoryNames[weakestCategory]} con una puntuación de ${scores[weakestCategory]}/10.`;

  return summary;
}
