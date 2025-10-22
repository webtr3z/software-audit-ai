import Anthropic from "@anthropic-ai/sdk";

// Lazy client creation to avoid errors during build/render
let anthropicClient: Anthropic | null = null;

const getAnthropicClient = () => {
  if (anthropicClient) {
    return anthropicClient;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === "user_provided") {
    throw new Error("ANTHROPIC_API_KEY no está configurado");
  }

  if (!apiKey.startsWith("sk-ant-")) {
    throw new Error("Formato de API key inválido. Debe comenzar con 'sk-ant-'");
  }

  anthropicClient = new Anthropic({ apiKey });
  return anthropicClient;
};

export interface FixSuggestion {
  issueId: string;
  originalCode: string;
  fixedCode: string;
  explanation: string;
  confidence: number;
  steps: string[];
}

export async function generateFixSuggestion(
  issue: {
    title: string;
    description: string;
    category: string;
    severity: string;
    file_path?: string;
    line_number?: number;
  },
  codeContext: string
): Promise<FixSuggestion> {
  const prompt = `Eres un experto en desarrollo de software. Se ha detectado el siguiente problema en el código:

**Problema:** ${issue.title}
**Descripción:** ${issue.description}
**Categoría:** ${issue.category}
**Severidad:** ${issue.severity}
${issue.file_path ? `**Archivo:** ${issue.file_path}` : ""}
${issue.line_number ? `**Línea:** ${issue.line_number}` : ""}

**Código actual:**
\`\`\`
${codeContext}
\`\`\`

Por favor, proporciona:
1. El código corregido
2. Una explicación clara de la solución
3. Pasos para implementar el fix
4. Tu nivel de confianza en esta solución (0-100)

Responde en formato JSON:
{
  "fixedCode": "código corregido aquí",
  "explanation": "explicación de la solución",
  "steps": ["paso 1", "paso 2", ...],
  "confidence": 85
}`;

  try {
    const anthropic = getAnthropicClient();
    const message = await anthropic.beta.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2000,
      temperature: 1,
      betas: ["web-search-2025-03-05"],
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Respuesta inesperada de la API");
    }

    // Extract JSON from response with error recovery
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No se pudo extraer JSON de la respuesta");
    }

    let result;
    try {
      result = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      // Try cleaning up common JSON issues
      const cleanedJson = jsonMatch[0]
        .replace(/,(\s*[}\]])/g, "$1")
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");
      result = JSON.parse(cleanedJson);
    }

    return {
      issueId: issue.title,
      originalCode: codeContext,
      fixedCode: result.fixedCode,
      explanation: result.explanation,
      confidence: result.confidence,
      steps: result.steps,
    };
  } catch (error) {
    console.error("Error generating fix suggestion:", error);
    throw new Error("No se pudo generar la sugerencia de corrección");
  }
}

export async function generateBatchFixSuggestions(
  issues: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    severity: string;
    file_path?: string;
    line_number?: number;
  }>,
  codeFiles: Map<string, string>
): Promise<FixSuggestion[]> {
  const suggestions: FixSuggestion[] = [];

  // Process high and critical severity issues first
  const prioritizedIssues = issues
    .filter((i) => i.severity === "critical" || i.severity === "high")
    .slice(0, 10); // Limit to 10 issues to avoid excessive API calls

  for (const issue of prioritizedIssues) {
    try {
      const codeContext = issue.file_path
        ? codeFiles.get(issue.file_path) || "Código no disponible"
        : "Código no disponible";

      const suggestion = await generateFixSuggestion(issue, codeContext);
      suggestions.push(suggestion);
    } catch (error) {
      console.error(`Error generating fix for issue ${issue.id}:`, error);
    }
  }

  return suggestions;
}
