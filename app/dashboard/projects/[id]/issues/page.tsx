import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { IssuesTable } from "@/components/issues-table"

export default async function ProjectIssuesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (projectError || !project) {
    notFound()
  }

  // Fetch latest analysis
  const { data: analysis } = await supabase
    .from("analyses")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (!analysis) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/projects/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Proyecto
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Este proyecto aún no ha sido analizado</p>
        </div>
      </div>
    )
  }

  // Fetch all issues
  const { data: issues } = await supabase.from("issues").select("*").eq("analysis_id", analysis.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/projects/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Proyecto
          </Link>
        </Button>
      </div>

      <div>
        <h2 className="text-3xl font-bold mb-2">{project.name}</h2>
        <p className="text-muted-foreground">Problemas detectados en el análisis</p>
      </div>

      <IssuesTable issues={issues || []} />
    </div>
  )
}
