"use server";

import { createClient } from "@/lib/supabase/server";

function generateSlug(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `audit-report-${timestamp}-${randomStr}`;
}

export async function generateConsolidatedReport(projectIds: string[]) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado", success: false };
  }

  if (!projectIds || projectIds.length === 0) {
    return {
      error: "Debes seleccionar al menos un proyecto",
      success: false,
    };
  }

  try {
    // Verify user owns all projects
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id, user_id, status")
      .in("id", projectIds);

    if (projectsError) {
      console.error("[v0] Error fetching projects:", projectsError);
      return { error: "Error al verificar proyectos", success: false };
    }

    // Check ownership
    const unauthorizedProjects = projects?.filter((p) => p.user_id !== user.id);
    if (unauthorizedProjects && unauthorizedProjects.length > 0) {
      return {
        error: "No tienes permisos para algunos proyectos",
        success: false,
      };
    }

    // Check all projects have completed status
    const incompletedProjects = projects?.filter(
      (p) => p.status !== "completed"
    );
    if (incompletedProjects && incompletedProjects.length > 0) {
      return {
        error: `${incompletedProjects.length} proyecto(s) no tienen análisis completado`,
        success: false,
      };
    }

    // Generate unique slug
    let slug = generateSlug();
    let attempts = 0;
    let slugExists = true;

    // Ensure slug is unique
    while (slugExists && attempts < 5) {
      const { data: existing } = await supabase
        .from("consolidated_reports")
        .select("id")
        .eq("slug", slug)
        .single();

      if (!existing) {
        slugExists = false;
      } else {
        slug = generateSlug();
        attempts++;
      }
    }

    if (slugExists) {
      return { error: "Error al generar URL única", success: false };
    }

    // Create consolidated report
    const { data: report, error: insertError } = await supabase
      .from("consolidated_reports")
      .insert({
        user_id: user.id,
        title: `Reporte Consolidado - ${new Date().toLocaleDateString(
          "es-ES"
        )}`,
        description: `Análisis consolidado de ${projectIds.length} proyecto(s)`,
        project_ids: projectIds,
        slug,
        is_public: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[v0] Error creating report:", insertError);
      return { error: "Error al crear el reporte", success: false };
    }

    return {
      success: true,
      slug: report.slug,
      reportId: report.id,
    };
  } catch (error: any) {
    console.error("[v0] Exception in generateConsolidatedReport:", error);
    return {
      error: error.message || "Error al generar el reporte",
      success: false,
    };
  }
}
