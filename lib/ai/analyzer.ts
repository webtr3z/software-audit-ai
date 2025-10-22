import Anthropic from "@anthropic-ai/sdk";
import { ANALYSIS_PROMPTS, type AnalysisCategory } from "./prompts";
import { getPrompt } from "./prompt-service";

// Lazy client creation to avoid errors during build/render
let anthropicClient: Anthropic | null = null;

const getAnthropicClient = () => {
  if (anthropicClient) {
    return anthropicClient;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  console.log("[v0] Anthropic API Key status:", {
    exists: !!apiKey,
    length: apiKey?.length || 0,
    prefix: apiKey?.substring(0, 15) || "undefined",
  });

  if (!apiKey || apiKey === "user_provided") {
    throw new Error(
      "ANTHROPIC_API_KEY no está configurado. Por favor configura tu API key en el archivo .env.local"
    );
  }

  // Validate API key format
  if (!apiKey.startsWith("sk-ant-")) {
    console.error("[v0] ⚠️ API key inválida! Debe comenzar con 'sk-ant-'");
    throw new Error(
      "Formato de API key inválido. Las claves de Anthropic deben comenzar con 'sk-ant-'"
    );
  }

  anthropicClient = new Anthropic({ apiKey });
  return anthropicClient;
};

export interface AnalysisResult {
  score: number;
  summary: string;
  issues: Array<{
    severity: "critical" | "high" | "medium" | "low" | "info";
    title: string;
    description: string;
    file_path?: string;
    line_number?: number;
    code_snippet?: string;
    suggested_fix?: string;
    impact?: string;
    performance_impact?: string;
    reproduction?: string;
    architectural_impact?: string;
  }>;
  recommendations: string[];
}

export interface CodeFile {
  path: string;
  content: string;
  language: string;
}

export interface AnalysisConfig {
  maxTokens?: number;
  temperature?: number;
  retryAttempts?: number;
}

export async function analyzeCodeCategory(
  category: AnalysisCategory,
  files: CodeFile[],
  userId: string,
  model: string = "claude-sonnet-4-5-20250929",
  retryCount: number = 0,
  config?: AnalysisConfig
): Promise<AnalysisResult> {
  const MAX_RETRIES = config?.retryAttempts || 2;
  const BASE_MAX_TOKENS = config?.maxTokens || 16384;
  const TEMPERATURE = config?.temperature || 1.0;

  console.log(
    `[v0] Starting ${category} analysis for ${
      files.length
    } files with model: ${model} (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`
  );
  console.log(`[v0] Using config:`, {
    maxTokens: BASE_MAX_TOKENS,
    temperature: TEMPERATURE,
  });

  // Prepare code context
  const codeContext = files
    .map((file) => {
      return `
=== Archivo: ${file.path} (${file.language}) ===
${file.content}
`;
    })
    .join("\n\n");

  // Get custom or default prompt for the category
  const categoryPrompt = await getPrompt(userId, category);

  const prompt = `${categoryPrompt}

CÓDIGO A ANALIZAR:
${codeContext}

IMPORTANTE: Responde SOLO con un JSON válido y completo. Asegúrate de que todas las cadenas estén correctamente cerradas y que el JSON sea parseable. Limita la respuesta a los problemas más críticos si es necesario para mantenerse dentro del límite de tokens.`;

  try {
    const anthropic = getAnthropicClient();

    // Increase max_tokens based on retry attempt, starting from configured base
    const maxTokens =
      retryCount === 0
        ? BASE_MAX_TOKENS
        : Math.min(BASE_MAX_TOKENS * 2, 200000);

    const message = await anthropic.beta.messages.create({
      model,
      max_tokens: maxTokens,
      temperature: TEMPERATURE,
      betas: ["web-search-2025-03-05"],
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    console.log(
      `[v0] ${category} analysis response received (${responseText.length} chars)`
    );

    // Check if response was potentially truncated
    const stopReason = message.stop_reason;
    if (stopReason === "max_tokens") {
      console.warn(`[v0] Response was truncated due to max_tokens limit`);
    }

    // Parse JSON response with error recovery
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No se pudo extraer JSON de la respuesta");
    }

    let result: AnalysisResult;
    try {
      // Try parsing as-is first
      result = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.log(`[v0] Initial JSON parse failed, attempting cleanup...`);

      // Common fixes for LLM-generated JSON
      let cleanedJson = jsonMatch[0]
        // Remove trailing commas before closing brackets
        .replace(/,(\s*[}\]])/g, "$1")
        // Fix common quote issues
        .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
        // Remove any markdown code block markers
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");

      try {
        result = JSON.parse(cleanedJson);
        console.log(`[v0] JSON cleanup successful`);
      } catch (cleanupError) {
        // Try to fix truncated JSON by detecting incomplete strings/arrays
        console.log(`[v0] Attempting to fix truncated JSON...`);

        try {
          // Find the last complete issue in the issues array
          const lastCompleteIssue = cleanedJson.lastIndexOf('"}');
          if (lastCompleteIssue > 0) {
            // Try to close the JSON properly
            let truncatedFixed = cleanedJson.substring(
              0,
              lastCompleteIssue + 2
            );

            // Close any open arrays or objects
            const openBraces = (truncatedFixed.match(/\{/g) || []).length;
            const closeBraces = (truncatedFixed.match(/\}/g) || []).length;
            const openBrackets = (truncatedFixed.match(/\[/g) || []).length;
            const closeBrackets = (truncatedFixed.match(/\]/g) || []).length;

            // Add missing closing brackets
            for (let i = 0; i < openBrackets - closeBrackets; i++) {
              truncatedFixed += "]";
            }
            // Add missing closing braces
            for (let i = 0; i < openBraces - closeBraces; i++) {
              truncatedFixed += "}";
            }

            result = JSON.parse(truncatedFixed);
            console.log(`[v0] Successfully recovered from truncated JSON`);
          } else {
            throw cleanupError;
          }
        } catch (recoveryError) {
          console.error(
            `[v0] Original JSON (first 500 chars):`,
            jsonMatch[0].substring(0, 500)
          );
          console.error(
            `[v0] Original JSON (last 500 chars):`,
            jsonMatch[0].substring(Math.max(0, jsonMatch[0].length - 500))
          );
          console.error(`[v0] Parse error:`, (parseError as any).message);

          // Retry with different parameters if we haven't exceeded retry limit
          if (retryCount < MAX_RETRIES) {
            console.log(`[v0] Retrying analysis with increased token limit...`);
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
            return analyzeCodeCategory(
              category,
              files,
              userId,
              model,
              retryCount + 1,
              config
            );
          }

          throw new Error(
            `No se pudo parsear el JSON de la respuesta después de ${
              MAX_RETRIES + 1
            } intentos: ${(parseError as any).message}`
          );
        }
      }
    }

    // Validate score is between 1-10
    if (result.score < 1 || result.score > 10) {
      result.score = Math.max(1, Math.min(10, result.score));
    }

    // Ensure required fields exist
    if (!result.summary) {
      result.summary = "Análisis completado";
    }
    if (!result.issues) {
      result.issues = [];
    }
    if (!result.recommendations) {
      result.recommendations = [];
    }

    console.log(
      `[v0] ${category} analysis completed successfully with ${result.issues.length} issues`
    );
    return result;
  } catch (error) {
    console.error(`[v0] Error in ${category} analysis:`, error);
    throw error;
  }
}

export async function analyzeCodeComplete(
  files: CodeFile[],
  userId: string,
  model: string = "claude-sonnet-4-5-20250929",
  projectId?: string,
  config?: AnalysisConfig
): Promise<{
  security: AnalysisResult;
  code_quality: AnalysisResult;
  performance: AnalysisResult;
  bugs: AnalysisResult;
  maintainability: AnalysisResult;
  architecture: AnalysisResult;
}> {
  console.log(
    `[v0] Starting complete analysis for ${files.length} files with model: ${model}`
  );
  if (config) {
    console.log(`[v0] Analysis config:`, config);
  }

  if (files.length === 0) {
    throw new Error("No hay archivos para analizar");
  }

  // Import status manager dynamically to avoid circular deps
  const { analysisStatusManager } = await import(
    "@/lib/analysis-status-manager"
  );

  // Helper to emit status
  const emitStatus = (message: string, stage: string) => {
    if (projectId) {
      analysisStatusManager.emit(projectId, message, stage);
    }
  };

  // Run analyses sequentially with status updates
  emitStatus("Analizando seguridad del código...", "security");
  const security = await analyzeCodeCategory(
    "security",
    files,
    userId,
    model,
    0,
    config
  );

  emitStatus("Evaluando calidad del código...", "code_quality");
  const code_quality = await analyzeCodeCategory(
    "code_quality",
    files,
    userId,
    model,
    0,
    config
  );

  emitStatus("Revisando rendimiento...", "performance");
  const performance = await analyzeCodeCategory(
    "performance",
    files,
    userId,
    model,
    0,
    config
  );

  emitStatus("Detectando bugs potenciales...", "bugs");
  const bugs = await analyzeCodeCategory(
    "bugs",
    files,
    userId,
    model,
    0,
    config
  );

  emitStatus("Analizando mantenibilidad...", "maintainability");
  const maintainability = await analyzeCodeCategory(
    "maintainability",
    files,
    userId,
    model,
    0,
    config
  );

  emitStatus("Evaluando arquitectura...", "architecture");
  const architecture = await analyzeCodeCategory(
    "architecture",
    files,
    userId,
    model,
    0,
    config
  );

  return {
    security,
    code_quality,
    performance,
    bugs,
    maintainability,
    architecture,
  };
}
