import type React from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileSearch, Home, FileText, BookOpen } from "lucide-react";
import { ReportNav } from "@/components/report-nav";
import { ReportExportButtons } from "@/components/report-export-buttons";

export default async function ReportLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch report
  const { data: report, error } = await supabase
    .from("consolidated_reports")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (error || !report) {
    notFound();
  }

  // Fetch projects
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .in("id", report.project_ids);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSearch className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">AuditCode AI</h1>
            </div>
            <div className="flex items-center gap-2">
              <ReportExportButtons reportSlug={slug} />
              <span className="text-sm text-muted-foreground px-2">
                Reporte Público
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar Navigation */}
          <aside className="space-y-4">
            <div className="sticky top-24">
              <ReportNav
                slug={slug}
                projects={projects || []}
                reportTitle={report.title || "Reporte Consolidado"}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main>{children}</main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Generado con{" "}
              <span className="text-primary font-semibold">AuditCode AI</span>
            </p>
            <p className="mt-2">
              {new Date(report.created_at).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
