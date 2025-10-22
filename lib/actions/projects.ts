"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const sourceType = formData.get("source_type") as string;
  const githubUrl = formData.get("github_url") as string | null;
  const githubToken = formData.get("github_token") as string | null;

  console.log(`[v0] 📝 Form data received:`);
  console.log(`[v0]   - Name: "${name}"`);
  console.log(`[v0]   - Source type: ${sourceType}`);
  if (sourceType === "github") {
    console.log(`[v0]   - GitHub URL: "${githubUrl}"`);
    console.log(`[v0]   - URL type: ${typeof githubUrl}`);
    console.log(`[v0]   - URL length: ${githubUrl?.length || 0}`);
    console.log(`[v0]   - Token provided: ${!!githubToken}`);
    if (githubToken) {
      console.log(`[v0]   - Token length: ${githubToken.length}`);
      console.log(`[v0]   - Token prefix: ${githubToken.substring(0, 10)}...`);
    }
  }

  try {
    // Create project record
    // Note: GitHub token would be stored in metadata, but for now we skip it if column doesn't exist
    // TODO: Run migration 006_add_projects_metadata.sql to add metadata column
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        source_type: sourceType,
        github_url: githubUrl,
        status: "pending",
      })
      .select()
      .single();

    // If metadata column exists and we have a token, update it separately
    if (githubToken) {
      try {
        await supabase
          .from("projects")
          .update({ metadata: { github_token: githubToken } })
          .eq("id", project.id);
      } catch (metadataError) {
        // Ignore metadata errors for now - the project is still created
        console.warn("Could not save GitHub token to metadata:", metadataError);
      }
    }

    if (projectError) throw projectError;

    // Process files if uploaded
    if (sourceType === "upload") {
      const files = formData.getAll("files") as File[];

      let totalLines = 0;
      const languages = new Set<string>();

      for (const file of files) {
        const content = await file.text();
        const lines = content.split("\n").length;
        totalLines += lines;

        // Detect language from extension
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext) {
          const langMap: Record<string, string> = {
            js: "JavaScript",
            jsx: "JavaScript",
            ts: "TypeScript",
            tsx: "TypeScript",
            py: "Python",
            java: "Java",
            cpp: "C++",
            c: "C",
            cs: "C#",
            go: "Go",
            rb: "Ruby",
            php: "PHP",
            swift: "Swift",
            kt: "Kotlin",
          };
          if (langMap[ext]) {
            languages.add(langMap[ext]);
          }
        }
      }

      // Update project with file stats
      await supabase
        .from("projects")
        .update({
          file_count: files.length,
          total_lines: totalLines,
          languages: Array.from(languages),
        })
        .eq("id", project.id);
    } else if (sourceType === "github") {
      // Analyze GitHub repository
      const { analyzeGitHubRepo } = await import("@/lib/github/analyzer");

      try {
        console.log(`[v0] Analyzing GitHub repository: ${githubUrl}`);
        console.log(
          `[v0] Using token: ${
            githubToken ? "Yes (provided)" : "No (public repo)"
          }`
        );

        const stats = await analyzeGitHubRepo(
          githubUrl!,
          githubToken || undefined
        );

        console.log(`[v0] Stats received:`, stats);

        const { error: updateError } = await supabase
          .from("projects")
          .update({
            file_count: stats.fileCount,
            total_lines: stats.totalLines,
            languages: stats.languages,
          })
          .eq("id", project.id);

        if (updateError) {
          console.error("[v0] Error updating project stats:", updateError);
          throw updateError;
        }

        console.log(
          `[v0] GitHub analysis complete: ${stats.fileCount} files, ${stats.totalLines} lines`
        );
      } catch (error: any) {
        console.error("[v0] GitHub analysis failed:", error);
        console.error("[v0] Error details:", {
          message: error.message,
          status: error.status,
          stack: error.stack,
        });

        // Don't set to 0 - leave existing values
        // This way if there's a transient error, we don't overwrite good data
        console.log(
          "[v0] Leaving file_count and total_lines at default values"
        );
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projects");

    return { projectId: project.id };
  } catch (error) {
    console.error("[v0] Error creating project:", error);
    return { error: "Error al crear el proyecto" };
  }
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  try {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId)
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projects");

    return { success: true };
  } catch (error) {
    console.error("[v0] Error deleting project:", error);
    return { error: "Error al eliminar el proyecto" };
  }
}

export async function updateProjectConfig(
  projectId: string,
  config: {
    ai_model?: string;
    max_tokens?: number;
    temperature?: number;
    analysis_config?: {
      retry_attempts?: number;
      timeout_minutes?: number;
    };
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  try {
    // Validate inputs
    if (
      config.max_tokens &&
      (config.max_tokens < 4096 || config.max_tokens > 200000)
    ) {
      return { error: "Los tokens máximos deben estar entre 4096 y 200000" };
    }

    if (
      config.temperature &&
      (config.temperature < 0 || config.temperature > 2)
    ) {
      return { error: "La temperatura debe estar entre 0 y 2" };
    }

    const { error } = await supabase
      .from("projects")
      .update({
        ai_model: config.ai_model,
        max_tokens: config.max_tokens,
        temperature: config.temperature,
        analysis_config: config.analysis_config,
      })
      .eq("id", projectId)
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath(`/dashboard/projects/${projectId}`);

    return { success: true };
  } catch (error) {
    console.error("[v0] Error updating project config:", error);
    return { error: "Error al actualizar la configuración" };
  }
}
