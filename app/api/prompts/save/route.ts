import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { savePrompt } from "@/lib/ai/prompt-service";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { promptType, promptContent } = await request.json();

    if (!promptType || !promptContent) {
      return NextResponse.json(
        { error: "Tipo de prompt y contenido requeridos" },
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

    // Validate content length (max 10000 characters)
    if (promptContent.length > 10000) {
      return NextResponse.json(
        { error: "El prompt es demasiado largo (máximo 10,000 caracteres)" },
        { status: 400 }
      );
    }

    const result = await savePrompt(user.id, promptType, promptContent);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Error al guardar el prompt" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[v0] Error in save prompt API:", error);
    return NextResponse.json(
      { error: error.message || "Error del servidor" },
      { status: 500 }
    );
  }
}
