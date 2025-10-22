import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  resetPromptToDefault,
  getDefaultPrompt,
} from "@/lib/ai/prompt-service";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { promptType } = await request.json();

    if (!promptType) {
      return NextResponse.json(
        { error: "Tipo de prompt requerido" },
        { status: 400 }
      );
    }

    // Validate prompt type
    const validTypes = [
      "security",
      "code_quality",
      "performance",
      "bugs",
      "maintainability",
      "architecture",
      "valuation",
    ];

    if (!validTypes.includes(promptType)) {
      return NextResponse.json(
        { error: "Tipo de prompt inválido" },
        { status: 400 }
      );
    }

    const result = await resetPromptToDefault(user.id, promptType);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Error al resetear el prompt" },
        { status: 500 }
      );
    }

    // Return the default prompt content
    const defaultPrompt = await getDefaultPrompt(promptType as any);

    return NextResponse.json({
      success: true,
      defaultPrompt,
    });
  } catch (error: any) {
    console.error("[v0] Error in reset prompt API:", error);
    return NextResponse.json(
      { error: error.message || "Error del servidor" },
      { status: 500 }
    );
  }
}
