"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play, Loader2, RotateCcw } from "lucide-react";
import { startAnalysis } from "@/lib/actions/analyze";
import { useToast } from "@/hooks/use-toast";
import { AnalysisStatus } from "@/components/analysis-status";
import { ModelSelector } from "@/components/model-selector";

export function StartAnalysisButton({
  projectId,
  isRetry = false,
}: {
  projectId: string;
  isRetry?: boolean;
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedModel, setSelectedModel] = useState(
    "claude-sonnet-4-5-20250929"
  );
  const router = useRouter();
  const { toast } = useToast();

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      console.log(`[v0] Starting analysis for project: ${projectId}`);
      const result = await startAnalysis(projectId);

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Análisis completado",
        description: "El análisis de tu proyecto ha finalizado exitosamente",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un error durante el análisis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-md">
      <ModelSelector
        value={selectedModel}
        onChange={setSelectedModel}
        disabled={isAnalyzing}
      />

      <AnalysisStatus isAnalyzing={isAnalyzing} projectId={projectId} />

      <Button
        onClick={handleStartAnalysis}
        disabled={isAnalyzing}
        size="lg"
        className="w-full"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analizando...
          </>
        ) : (
          <>
            {isRetry ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reintentar Análisis
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Iniciar Análisis
              </>
            )}
          </>
        )}
      </Button>
    </div>
  );
}
