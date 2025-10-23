"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileDown, FileText, AlignLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportConsolidatedReport } from "@/lib/actions/export-report";

interface ReportExportButtonsProps {
  reportSlug: string;
}

export function ReportExportButtons({ reportSlug }: ReportExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: "markdown" | "text") => {
    setIsExporting(true);
    try {
      const result = await exportConsolidatedReport({
        slug: reportSlug,
        format,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.success && result.content && result.filename) {
        // Create blob and download
        const blob = new Blob([result.content], {
          type: format === "markdown" ? "text/markdown" : "text/plain",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "✅ Reporte Exportado",
          description: `El reporte se ha descargado como ${result.filename}`,
        });
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo exportar el reporte",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" size="sm" disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4 mr-2" />
              Exportar
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport("markdown")}
          disabled={isExporting}
        >
          <FileText className="h-4 w-4 mr-2" />
          Exportar como Markdown (.md)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("text")}
          disabled={isExporting}
        >
          <AlignLeft className="h-4 w-4 mr-2" />
          Exportar como Texto (.txt)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
