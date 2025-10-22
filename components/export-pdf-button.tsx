"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportPDFButtonProps {
  projectId: string;
  projectName: string;
}

export function ExportPDFButton({
  projectId,
  projectName,
}: ExportPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleExportPDF = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch(`/api/export/pdf/${projectId}`);

      if (!response.ok) {
        throw new Error("Error al generar el PDF");
      }

      // Get the blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `auditoria-${projectName.replace(
        /[^a-z0-9]/gi,
        "-"
      )}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "PDF generado exitosamente",
        description: "El reporte se ha descargado a tu dispositivo.",
      });
    } catch (error) {
      console.error("[v0] Error exporting PDF:", error);
      toast({
        title: "Error al generar PDF",
        description: "No se pudo generar el reporte. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleExportPDF}
      disabled={isGenerating}
      variant="outline"
      className="gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generando PDF...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4" />
          Exportar PDF
        </>
      )}
    </Button>
  );
}
