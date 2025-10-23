import AgentsLoader from "@/components/loaders/agents-loader";
import GeometricLoader from "@/components/loaders/geometric-loader";
import RectsLoader from "@/components/loaders/rects-loader";
import { Card, CardContent } from "@/components/ui/card";
import SparkyLoader from "@/components/loaders/sparky-loader";
import { AnalysisStatus } from "@/components/analysis-status";

export default function PlaygroundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-8">
      {/* <Card className="w-48 h-48 mx-auto">
        <CardContent className="flex items-center justify-center h-full">
          <RectsLoader />
        </CardContent>
      </Card> */}
      <GeometricLoader />
      {/* <RectsLoader /> */}
      <AnalysisStatus isAnalyzing={true} projectId="123" />
    </div>
  );
}
