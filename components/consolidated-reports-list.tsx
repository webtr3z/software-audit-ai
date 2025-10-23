"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  ExternalLink,
  Copy,
  Trash2,
  Calendar,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ConsolidatedReport {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  project_ids: string[];
  created_at: string;
  is_public: boolean;
}

interface ConsolidatedReportsListProps {
  reports: ConsolidatedReport[];
}

export function ConsolidatedReportsList({
  reports,
}: ConsolidatedReportsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/reports/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "✅ Enlace copiado",
      description: "El enlace del reporte se copió al portapapeles",
    });
  };

  const handleDelete = async (reportId: string) => {
    setDeletingId(reportId);

    try {
      const response = await fetch("/api/reports/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el reporte");
      }

      toast({
        title: "✅ Reporte eliminado",
        description: "El reporte consolidado se eliminó correctamente",
      });

      // Refresh the page to update the list
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo eliminar el reporte",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reportes Consolidados</CardTitle>
          <CardDescription>
            Aún no has generado ningún reporte consolidado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground max-w-md">
              Selecciona proyectos de la tabla de abajo y genera tu primer
              reporte consolidado para ver análisis combinados y métricas
              generales.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reportes Consolidados</CardTitle>
        <CardDescription>
          {reports.length} reporte{reports.length !== 1 ? "s" : ""} generado
          {reports.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">{report.title}</h3>
                    {report.is_public && (
                      <Badge variant="outline" className="text-xs">
                        Público
                      </Badge>
                    )}
                  </div>

                  {report.description && (
                    <p className="text-sm text-muted-foreground">
                      {report.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(report.created_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <FolderOpen className="h-4 w-4" />
                      {report.project_ids.length} proyecto
                      {report.project_ids.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/reports/${report.slug}`} target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink(report.slug)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={deletingId === report.id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          ¿Eliminar reporte consolidado?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. El reporte será
                          eliminado permanentemente y el enlace público dejará
                          de funcionar.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(report.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
