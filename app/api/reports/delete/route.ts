import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { reportId } = await request.json();

    if (!reportId) {
      return NextResponse.json(
        { error: "ID de reporte requerido." },
        { status: 400 }
      );
    }

    // Verify the user owns the report
    const { data: report, error: fetchError } = await supabase
      .from("consolidated_reports")
      .select("user_id")
      .eq("id", reportId)
      .single();

    if (fetchError || !report) {
      return NextResponse.json(
        { error: "Reporte no encontrado." },
        { status: 404 }
      );
    }

    if (report.user_id !== user.id) {
      return NextResponse.json(
        { error: "No autorizado para eliminar este reporte." },
        { status: 403 }
      );
    }

    // Delete the report
    const { error: deleteError } = await supabase
      .from("consolidated_reports")
      .delete()
      .eq("id", reportId);

    if (deleteError) {
      console.error("[v0] Error deleting consolidated report:", deleteError);
      return NextResponse.json(
        { error: "Error al eliminar el reporte." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[v0] Error in delete report API:", error);
    return NextResponse.json(
      { error: error.message || "Error del servidor al eliminar el reporte." },
      { status: 500 }
    );
  }
}
