"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import GeometricLoader from "./loaders/geometric-loader";

interface AnalysisStatusProps {
  isAnalyzing: boolean;
  projectId: string;
}

export function AnalysisStatus({
  isAnalyzing,
  projectId,
}: AnalysisStatusProps) {
  const [statusMessage, setStatusMessage] = useState("Iniciando análisis...");
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!isAnalyzing) {
      setStatusMessage("Iniciando análisis...");
      setDots("");
      return;
    }

    // Connect to SSE endpoint
    const eventSource = new EventSource(`/api/analysis/status/${projectId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status) {
          setStatusMessage(data.status);
          console.log("[v0] Status update:", data.status);
        }
      } catch (error) {
        console.error("[v0] Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("[v0] SSE connection error:", error);
      eventSource.close();
    };

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => {
      console.log("[v0] Closing SSE connection");
      eventSource.close();
      clearInterval(dotsInterval);
    };
  }, [isAnalyzing, projectId]);

  if (!isAnalyzing) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="">
        <div className="flex items-center gap-3 justify-center">
          <GeometricLoader />
          {/* <Loader2 className="h-5 w-5 text-primary animate-spin" />
          <div className="flex-1 text-center max-w-md mx-auto">
            <p className="text-sm font-medium text-primary">
              {statusMessage}
              <span className="inline-block w-8 text-left">{dots}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Esto puede tomar entre 1-2 minutos. Por favor espera...
            </p>
          </div> */}
        </div>

        {/* Simple progress bar */}
        {/* <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary animate-pulse"
            style={{ width: "60%" }}
          />
        </div> */}
      </CardContent>
    </Card>
  );
}
