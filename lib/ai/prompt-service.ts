"use server";

import { createClient } from "@/lib/supabase/server";
import { ANALYSIS_PROMPTS } from "./prompts";

// Valuation prompt constant (from valuation.ts)
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

export type PromptType =
  | "security"
  | "code_quality"
  | "performance"
  | "bugs"
  | "maintainability"
  | "architecture"
  | "valuation";

export interface PromptTemplate {
  id: string;
  user_id: string;
  prompt_type: PromptType;
  prompt_content: string;
  is_custom: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

/**
 * Get a prompt for a specific analysis type
 * Fetches custom prompt if available, otherwise returns default
 */
export async function getPrompt(
  userId: string,
  promptType: PromptType
): Promise<string> {
  try {
    const supabase = await createClient();

    // Try to fetch custom prompt
    const { data, error } = await supabase
      .from("prompt_templates")
      .select("prompt_content")
      .eq("user_id", userId)
      .eq("prompt_type", promptType)
      .single();

    if (data && !error) {
      console.log(`[v0] Using custom prompt for ${promptType}`);
      return data.prompt_content;
    }

    // Fallback to default prompts
    console.log(`[v0] Using default prompt for ${promptType}`);
    if (promptType === "valuation") {
      return VALUATION_PROMPT;
    }

    return ANALYSIS_PROMPTS[promptType as keyof typeof ANALYSIS_PROMPTS];
  } catch (error) {
    console.error(`[v0] Error fetching prompt for ${promptType}:`, error);
    // Fallback to default prompts on error
    if (promptType === "valuation") {
      return VALUATION_PROMPT;
    }
    return ANALYSIS_PROMPTS[promptType as keyof typeof ANALYSIS_PROMPTS];
  }
}

/**
 * Save or update a custom prompt
 */
export async function savePrompt(
  userId: string,
  promptType: PromptType,
  promptContent: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("prompt_templates").upsert(
      {
        user_id: userId,
        prompt_type: promptType,
        prompt_content: promptContent,
        is_custom: true,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,prompt_type",
      }
    );

    if (error) {
      console.error("[v0] Error saving prompt:", error);
      return { success: false, error: error.message };
    }

    console.log(`[v0] Prompt saved successfully for ${promptType}`);
    return { success: true };
  } catch (error: any) {
    console.error("[v0] Error saving prompt:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

/**
 * Reset prompt to default by deleting the custom version
 */
export async function resetPromptToDefault(
  userId: string,
  promptType: PromptType
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("prompt_templates")
      .delete()
      .eq("user_id", userId)
      .eq("prompt_type", promptType);

    if (error) {
      console.error("[v0] Error resetting prompt:", error);
      return { success: false, error: error.message };
    }

    console.log(`[v0] Prompt reset to default for ${promptType}`);
    return { success: true };
  } catch (error: any) {
    console.error("[v0] Error resetting prompt:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

/**
 * Get all prompts for a user (custom or default)
 */
export async function getAllUserPrompts(
  userId: string
): Promise<Record<PromptType, string>> {
  const prompts: Record<string, string> = {};

  const promptTypes: PromptType[] = [
    "security",
    "code_quality",
    "performance",
    "bugs",
    "maintainability",
    "architecture",
    "valuation",
  ];

  for (const type of promptTypes) {
    prompts[type] = await getPrompt(userId, type);
  }

  return prompts as Record<PromptType, string>;
}

/**
 * Get default prompt for a given type
 */
export async function getDefaultPrompt(
  promptType: PromptType
): Promise<string> {
  if (promptType === "valuation") {
    return VALUATION_PROMPT;
  }
  return ANALYSIS_PROMPTS[promptType as keyof typeof ANALYSIS_PROMPTS];
}
