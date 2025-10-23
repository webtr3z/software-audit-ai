"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePDF, Resolution, Margin } from "react-to-pdf";

interface ExportConsolidatedReportPDFProps {
  reportSlug: string;
}

export function ExportConsolidatedReportPDF({
  reportSlug,
}: ExportConsolidatedReportPDFProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const options = {
    filename: `reporte-consolidado-${reportSlug}.pdf`,
    method: "save" as const,
    resolution: Resolution.MEDIUM,
    page: {
      margin: Margin.SMALL,
      format: "a4" as const,
      orientation: "portrait" as const,
    },
    canvas: {
      mimeType: "image/jpeg" as const,
      qualityRatio: 0.9,
    },
    overrides: {
      pdf: {
        compress: true,
      },
      canvas: {
        useCORS: true,
        scale: 2,
        logging: false,
        backgroundColor: "#ffffff",
        removeContainer: true,
        imageTimeout: 0,
        // Ignore elements that might have problematic colors
        ignoreElements: (element: Element) => {
          // Skip hidden elements
          const style = window.getComputedStyle(element);
          return style.display === "none" || style.visibility === "hidden";
        },
      },
    },
  };

  const { toPDF, targetRef } = usePDF(options);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Add print-optimized class to body
      document.body.classList.add("pdf-export-mode");

      // Delay to allow styles to apply and render
      await new Promise((resolve) => setTimeout(resolve, 800));

      await toPDF();

      toast({
        title: "✅ PDF Generado",
        description: "El reporte consolidado se ha exportado correctamente.",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      // Remove print-optimized class
      document.body.classList.remove("pdf-export-mode");
      setIsExporting(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handleExport}
        disabled={isExporting}
        variant="default"
        size="sm"
        className="gap-2"
      >
        {isExporting ? (
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

      {/* Export target ref - passed to parent component */}
      <div style={{ display: "none" }} ref={targetRef} />
    </div>
  );
}

// Hook to get the ref for the content
export function useReportPDFExport(reportSlug: string) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const options = {
    filename: `reporte-consolidado-${reportSlug}.pdf`,
    method: "save" as const,
    resolution: Resolution.MEDIUM,
    page: {
      margin: Margin.SMALL,
      format: "a4" as const,
      orientation: "portrait" as const,
    },
    canvas: {
      mimeType: "image/jpeg" as const,
      qualityRatio: 0.9,
    },
    overrides: {
      pdf: {
        compress: true,
      },
      canvas: {
        useCORS: true,
        scale: 2,
        logging: false,
        backgroundColor: "#ffffff",
        removeContainer: true,
        imageTimeout: 0,
        ignoreElements: (element: Element) => {
          const style = window.getComputedStyle(element);
          return style.display === "none" || style.visibility === "hidden";
        },
      },
    },
  };

  const { toPDF, targetRef } = usePDF(options);

  const exportPDF = async () => {
    setIsExporting(true);
    try {
      // Add print-optimized class
      document.body.classList.add("pdf-export-mode");

      // Delay to allow styles to apply and render
      await new Promise((resolve) => setTimeout(resolve, 800));

      await toPDF();

      toast({
        title: "✅ PDF Generado",
        description: "El reporte consolidado se ha exportado correctamente.",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      document.body.classList.remove("pdf-export-mode");
      setIsExporting(false);
    }
  };

  return { exportPDF, targetRef, isExporting };
}
