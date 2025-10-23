"use client";

import { useReportPDFExport } from "./export-consolidated-report-pdf";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useEffect } from "react";

interface ReportPDFExportButtonProps {
  reportSlug: string;
}

export function ReportPDFExportButton({
  reportSlug,
}: ReportPDFExportButtonProps) {
  const { exportPDF, targetRef, isExporting } = useReportPDFExport(reportSlug);

  useEffect(() => {
    // Attach the ref to the main content area
    const mainContent = document.querySelector("main");
    if (mainContent && targetRef.current !== mainContent) {
      // Store reference
      (targetRef as any).current = mainContent;
    }
  }, [targetRef]);

  return (
    <Button
      onClick={exportPDF}
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
  );
}
