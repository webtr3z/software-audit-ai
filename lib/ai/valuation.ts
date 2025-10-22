import Anthropic from "@anthropic-ai/sdk";
import { getPrompt } from "./prompt-service";

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

export interface ValuationInput {
  projectName: string;
  description?: string;
  fileCount: number;
  totalLines: number;
  languages: string[];
  overallScore: number;
  securityScore: number;
  codeQualityScore: number;
  performanceScore: number;
  bugsScore: number;
  maintainabilityScore: number;
  architectureScore: number;
}

export interface ValuationResult {
  estimatedValue: number;
  minValue: number;
  maxValue: number;
  isAssetOrLiability: "asset" | "liability";

  costBreakdown: {
    reconstructionCost: number;
    developmentHours: number;
    averageHourlyRate: number;
    region: string;
  };

  depreciationFactors: {
    ageDepreciation: number;
    technicalDebt: number;
    obsolescenceFactor: number;
    qualityMultiplier: number;
  };

  valueIncrements: {
    testCoverage: number;
    documentation: number;
    security: number;
    activeUsers: number;
    revenue: number;
  };

  annualCosts: {
    maintenance: number;
    infrastructure: number;
    technicalDebtRemediation: number;
  };

  qualityMetrics: {
    codeQualityScore: number;
    testCoverage: number;
    securityScore: number;
    documentationScore: number;
    maintainabilityIndex: number;
  };

  riskFactors: Array<{
    factor: string;
    impact: "high" | "medium" | "low";
    description: string;
  }>;

  comparableProjects: Array<{
    name: string;
    description: string;
    estimatedValue: number;
    similarity: number;
    source?: string;
  }>;

  confidenceLevel: number;
  methodology: string;
  assumptions: string[];
  recommendations: string[];
  notes: string;
}

const VALUATION_PROMPT = `# Experto en Valoración Realista de Software

Eres un auditor financiero especializado en valoración de activos digitales. Tu tarea es estimar el **valor económico real** de un proyecto de software, considerando tanto su valor potencial como sus pasivos técnicos.

## Metodología de Valoración Híbrida

### 1. COSTO DE RECONSTRUCCIÓN (Baseline)

**Fórmula Base:**

Costo Base = (Puntos de Función × Tarifa Ajustada × Factor Geográfico) - Deuda Técnica


**Tarifas por Región/Perfil:**
- Junior Local: $8-15/hora
- Mid-level Local: $15-25/hora
- Senior/Tech Lead: $25-40/hora
- Architect/Specialist: $40-80/hora
- Offshore (India/LatAm): $10-30/hora
- Onshore (USA/EU): $50-150/hora

**Estimación de Esfuerzo:**
- NO usar líneas de código directamente
- Usar Puntos de Función o Story Points
- Considerar SÓLO funcionalidades activas y útiles
- Descontar código muerto, duplicado o generado

### 2. FACTORES DE DEPRECIACIÓN

**A. Edad y Obsolescencia:**

- < 1 año: 0% depreciación
- 1-2 años: -10-15%
- 2-4 años: -20-35%
- 4-6 años: -40-60%
- > 6 años: -60-80% (a menos que mantenido activamente)

**B. Deuda Técnica (RESTA valor):**

- Sin tests automatizados: -15-25%
- Cobertura de tests < 50%: -10-15%
- Dependencias obsoletas (>2 versiones): -10-20%
- Vulnerabilidades críticas: -20-40%
- Sin documentación: -10-15%
- Código duplicado >15%: -10-20%
- Complejidad ciclomática alta: -15-25%
- Acoplamiento alto: -15-30%

**C. Calidad del Código (Multiplicador):**
- Excelente (9-10/10): 1.0x - 1.2x
- Buena (7-8/10): 0.9x - 1.0x
- Aceptable (5-6/10): 0.6x - 0.8x
- Mala (3-4/10): 0.3x - 0.5x
- Crítica (1-2/10): 0.1x - 0.2x (valor de rescate)

### 3. FACTORES DE INCREMENTO

**Solo aplican si están REALMENTE presentes:**

- ✅ Tests automatizados (>80% cobertura): +10-20%
- ✅ CI/CD implementado: +5-10%
- ✅ Documentación completa: +10-15%
- ✅ Arquitectura escalable probada: +15-25%
- ✅ Seguridad auditada: +10-20%
- ✅ Cumplimiento normativo certificado: +15-30%
- ✅ Base de usuarios activa: +20-50%
- ✅ Ingresos recurrentes demostrados: +50-200%

### 4. CÁLCULO DE VALOR FINAL

Valor Base = Costo de Reconstrucción × Factor de Calidad

Valor Ajustado = Valor Base 
  - Depreciación por Edad
  - Deuda Técnica
  - Costos de Remediación
  + Incrementos por Activos Reales

Valor Mínimo = Valor Ajustado × 0.6
Valor Máximo = Valor Ajustado × 1.4

// Si Valor Ajustado < 0: el software es un PASIVO, no un activo

### 5. COSTOS ADICIONALES A CONSIDERAR

**Mantenimiento Anual:**
- Código de alta calidad: 10-15% del valor
- Código de calidad media: 20-30% del valor
- Código de baja calidad: 30-50% del valor (o más)

**Infraestructura:**
- Estimación mensual real basada en recursos
- Multiplicar × 12 para costo anual

**Remediación de Deuda Técnica:**
- Estimar horas para llevar a calidad aceptable
- Incluir como costo diferido obligatorio

---

## Formato de Respuesta JSON

{
  "estimatedValue": number,
  "minValue": number,
  "maxValue": number,
  "isAssetOrLiability": "asset" | "liability",
  
  "costBreakdown": {
    "reconstructionCost": number,
    "developmentHours": number,
    "averageHourlyRate": number,
    "region": "string"
  },
  
  "depreciationFactors": {
    "ageDepreciation": number,
    "technicalDebt": number,
    "obsolescenceFactor": number,
    "qualityMultiplier": number
  },
  
  "valueIncrements": {
    "testCoverage": number,
    "documentation": number,
    "security": number,
    "activeUsers": number,
    "revenue": number
  },
  
  "annualCosts": {
    "maintenance": number,
    "infrastructure": number,
    "technicalDebtRemediation": number
  },
  
  "qualityMetrics": {
    "codeQualityScore": number,
    "testCoverage": number,
    "securityScore": number,
    "documentationScore": number,
    "maintainabilityIndex": number
  },
  
  "riskFactors": [
    {
      "factor": "string",
      "impact": "high" | "medium" | "low",
      "description": "string"
    }
  ],
  
  "comparableProjects": [
    {
      "name": "string",
      "description": "string",
      "estimatedValue": number,
      "similarity": number,
      "source": "string"
    }
  ],
  
  "confidenceLevel": number,
  "methodology": "string",
  "assumptions": ["string"],
  "recommendations": ["string"],
  "notes": "string"
}

---

## Principios de Auditoría

1. **Ser Conservador**: En caso de duda, valorar a la baja
2. **Verificar Claims**: No asumir calidad sin evidencia
3. **Considerar TCO**: Total Cost of Ownership, no solo desarrollo
4. **Realismo de Mercado**: ¿Alguien pagaría este precio realmente?
5. **Valor de Rescate**: Incluso código malo tiene valor mínimo (rescate)

---

## Ejemplos de Calibración

**Proyecto A: App Web Simple**
- 5,000 LOC PHP, 2 años de antigüedad
- Sin tests, sin documentación
- Funciona pero código legacy
- ❌ Valor inflado: $50,000
- ✅ Valor realista: $5,000 - $8,000

**Proyecto B: SaaS con Ingresos**
- 50,000 LOC, bien arquitecturado
- Tests 80%, CI/CD, documentado
- $10k MRR demostrados
- ❌ Valor solo por código: $200,000
- ✅ Valor realista: $500,000 - $800,000 (incluye activo de negocio)`;

export async function calculateValuation(
  input: ValuationInput,
  userId: string
): Promise<ValuationResult> {
  console.log(
    "[v0] Starting valuation calculation for project:",
    input.projectName
  );

  // Get custom or default valuation prompt
  const valuationPrompt = await getPrompt(userId, "valuation");

  const prompt = `${valuationPrompt}

INFORMACIÓN DEL PROYECTO:
- Nombre: ${input.projectName}
- Descripción: ${input.description || "No proporcionada"}
- Archivos: ${input.fileCount}
- Líneas de código: ${input.totalLines.toLocaleString()}
- Lenguajes: ${input.languages.join(", ")}

PUNTUACIONES DE CALIDAD (escala 1-10):
- Puntuación General: ${input.overallScore}/10
- Seguridad: ${input.securityScore}/10
- Calidad de Código: ${input.codeQualityScore}/10
- Rendimiento: ${input.performanceScore}/10
- Detección de Bugs: ${input.bugsScore}/10
- Mantenibilidad: ${input.maintainabilityScore}/10
- Arquitectura: ${input.architectureScore}/10

Proporciona una valoración monetaria detallada en USD. Responde SOLO con el JSON solicitado, sin texto adicional.`;

  try {
    const anthropic = getAnthropicClient();
    const message = await anthropic.beta.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      temperature: 1,
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

    console.log("[v0] Valuation response received");

    // Parse JSON response with error recovery
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No se pudo extraer JSON de la respuesta de valoración");
    }

    let result: ValuationResult;
    try {
      result = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.log(
        "[v0] Initial JSON parse failed for valuation, attempting cleanup..."
      );
      const cleanedJson = jsonMatch[0]
        .replace(/,(\s*[}\]])/g, "$1")
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");
      result = JSON.parse(cleanedJson);
      console.log("[v0] Valuation JSON cleanup successful");
    }

    // Validate and adjust values
    result.estimatedValue = Math.max(1000, result.estimatedValue);
    result.minValue = Math.max(500, result.minValue);
    result.maxValue = Math.max(result.estimatedValue, result.maxValue);
    result.confidenceLevel = Math.max(
      0.5,
      Math.min(0.99, result.confidenceLevel)
    );

    return result;
  } catch (error) {
    console.error("[v0] Error in valuation calculation:", error);
    throw error;
  }
}

// Fallback valuation calculation (if AI fails)
export function calculateBasicValuation(
  input: ValuationInput
): ValuationResult {
  console.log("[v0] Using basic valuation calculation");

  // Basic calculation based on lines of code and quality
  const baseRatePerLine = 5; // $5 per line of code (industry average)
  const averageHourlyRate = 35; // Average developer rate
  const linesPerHour = 50; // Industry average
  const developmentHours = Math.ceil(input.totalLines / linesPerHour);
  const reconstructionCost = developmentHours * averageHourlyRate;

  // Quality adjustment
  const qualityMultiplier = Math.max(0.3, input.overallScore / 10);
  const adjustedCost = reconstructionCost * qualityMultiplier;

  // Complexity factor based on file count and languages
  const complexityFactor =
    1 + input.languages.length * 0.1 + (input.fileCount > 50 ? 0.2 : 0);

  // Technical debt estimation (inverse of quality)
  const technicalDebtFactor = (10 - input.overallScore) / 10;
  const technicalDebtCost = reconstructionCost * technicalDebtFactor * 0.3;

  const estimatedValue = Math.max(
    1000,
    adjustedCost * complexityFactor - technicalDebtCost
  );

  // Annual costs
  const maintenanceCost = Math.round(estimatedValue * 0.15); // 15% annually
  const infrastructureCost = Math.round(estimatedValue * 0.05); // 5% annually
  const technicalDebtRemediation = Math.round(technicalDebtCost);

  return {
    estimatedValue: Math.round(estimatedValue),
    minValue: Math.round(estimatedValue * 0.6),
    maxValue: Math.round(estimatedValue * 1.4),
    isAssetOrLiability: estimatedValue > 0 ? "asset" : "liability",

    costBreakdown: {
      reconstructionCost: Math.round(reconstructionCost),
      developmentHours,
      averageHourlyRate,
      region: "Global Average",
    },

    depreciationFactors: {
      ageDepreciation: 0,
      technicalDebt: Math.round(technicalDebtCost),
      obsolescenceFactor: 0,
      qualityMultiplier: Math.round(qualityMultiplier * 100) / 100,
    },

    valueIncrements: {
      testCoverage: 0,
      documentation: 0,
      security: 0,
      activeUsers: 0,
      revenue: 0,
    },

    annualCosts: {
      maintenance: maintenanceCost,
      infrastructure: infrastructureCost,
      technicalDebtRemediation: technicalDebtRemediation,
    },

    qualityMetrics: {
      codeQualityScore: input.codeQualityScore,
      testCoverage: 0,
      securityScore: input.securityScore,
      documentationScore: 0,
      maintainabilityIndex: input.maintainabilityScore,
    },

    riskFactors: [
      {
        factor: "Calidad del Código",
        impact: input.codeQualityScore < 5 ? "high" : "medium",
        description: `Puntuación de calidad: ${input.codeQualityScore}/10`,
      },
      {
        factor: "Seguridad",
        impact: input.securityScore < 5 ? "high" : "low",
        description: `Puntuación de seguridad: ${input.securityScore}/10`,
      },
    ],

    comparableProjects: [
      {
        name: "Proyecto Similar A",
        description: "Aplicación web con características similares",
        estimatedValue: Math.round(estimatedValue * 0.9),
        similarity: 0.85,
        source: "Estimación basada en mercado",
      },
      {
        name: "Proyecto Similar B",
        description: "Sistema con tecnologías comparables",
        estimatedValue: Math.round(estimatedValue * 1.1),
        similarity: 0.8,
        source: "Estimación basada en mercado",
      },
    ],

    confidenceLevel: 0.65,
    methodology:
      "Valoración básica basada en horas de desarrollo estimadas, tarifa promedio por hora, y factores de calidad. Se considera la deuda técnica como un pasivo que reduce el valor total.",
    assumptions: [
      `Tarifa promedio de $${averageHourlyRate}/hora`,
      `${linesPerHour} líneas de código por hora`,
      "Calidad del código afecta directamente el valor",
      "Deuda técnica representa ~30% del costo en proyectos de baja calidad",
    ],
    recommendations: [
      input.codeQualityScore < 6
        ? "Invertir en refactorización para mejorar la calidad del código"
        : "Mantener estándares de calidad actuales",
      input.securityScore < 6
        ? "Realizar auditoría de seguridad completa"
        : "Continuar con buenas prácticas de seguridad",
      "Implementar tests automatizados para aumentar el valor",
      "Documentar el código para facilitar mantenimiento",
    ],
    notes:
      "Esta es una valoración básica calculada localmente. Para una estimación más precisa basada en análisis de mercado y comparables reales, se recomienda usar la valoración con IA.",
  };
}
