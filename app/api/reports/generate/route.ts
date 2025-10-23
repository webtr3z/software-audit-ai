import { NextRequest, NextResponse } from "next/server";
import { generateConsolidatedReport } from "@/lib/actions/generate-consolidated-report";

export async function POST(request: NextRequest) {
  try {
    const { projectIds } = await request.json();

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return NextResponse.json(
        { error: "Debe proporcionar un array de project IDs" },
        { status: 400 }
      );
    }

    const result = await generateConsolidatedReport(projectIds);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Error al generar reporte" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      slug: result.slug,
      reportId: result.reportId,
    });
  } catch (error: any) {
    console.error("[v0] Exception in generate report API:", error);
    return NextResponse.json(
      { error: error.message || "Error del servidor" },
      { status: 500 }
    );
  }
}
