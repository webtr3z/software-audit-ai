"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileJson, FileSpreadsheet, FileText } from "lucide-react";
import { exportAnalysisJSON, exportAnalysisCSV } from "@/lib/actions/export";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonsProps {
  projectId: string;
  projectName: string;
}

export function ExportButtons({ projectId, projectName }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const data = await exportAnalysisJSON(projectId);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName}-analisis.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Exportación exitosa",
        description: "El análisis se ha exportado en formato JSON",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo exportar el análisis",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csvContent = await exportAnalysisCSV(projectId);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName}-problemas.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Exportación exitosa",
        description: "Los problemas se han exportado en formato CSV",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo exportar los problemas",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/export/pdf/${projectId}`);

      if (!response.ok) {
        throw new Error("Error al generar el PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `auditoria-${projectName.replace(
        /[^a-z0-9]/gi,
        "-"
      )}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF generado exitosamente",
        description: "El reporte completo se ha descargado",
      });
    } catch (error) {
      console.error("[v0] Error exporting PDF:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el reporte PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Exportando..." : "Exportar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportJSON}>
          <FileJson className="mr-2 h-4 w-4" />
          Exportar como JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar problemas (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Exportar como PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
