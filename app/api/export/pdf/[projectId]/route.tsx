import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { PDFReport } from "@/components/pdf-report";
import React from "react";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response("No autenticado", { status: 401 });
    }

    // Fetch project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return new Response("Proyecto no encontrado", { status: 404 });
    }

    // Fetch latest analysis
    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (analysisError || !analysis) {
      return new Response("Análisis no encontrado", { status: 404 });
    }

    // Fetch issues
    const { data: issues } = await supabase
      .from("issues")
      .select("*")
      .eq("analysis_id", analysis.id)
      .order("severity", { ascending: true });

    // Fetch valuation
    const { data: valuation } = await supabase
      .from("valuations")
      .select("*")
      .eq("analysis_id", analysis.id)
      .single();

    // Generate PDF
    console.log("[v0] Generating PDF report for project:", project.name);

    const pdfDocument = (
      <PDFReport
        project={project}
        analysis={analysis}
        valuation={valuation}
        issues={issues || []}
      />
    );

    const pdfBuffer = await renderToBuffer(pdfDocument);

    // Return PDF
    const filename = `auditoria-${project.name.replace(
      /[^a-z0-9]/gi,
      "-"
    )}-${Date.now()}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[v0] Error generating PDF:", error);
    return new Response("Error al generar el PDF", { status: 500 });
  }
}
