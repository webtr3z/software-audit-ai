"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import GeometricLoader from "./loaders/geometric-loader";
import SparkyLoader from "./loaders/sparky-loader";

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
    <Card className="p-[0px]!">
      <CardContent className="p-[0px]!">
        <div className="flex items-center gap-3 justify-center">
          <SparkyLoader />
        </div>
      </CardContent>
    </Card>
  );
}
