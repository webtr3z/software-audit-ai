import AgentsLoader from "@/components/loaders/agents-loader";
import GeometricLoader from "@/components/loaders/geometric-loader";
import RectsLoader from "@/components/loaders/rects-loader";
import { Card, CardContent } from "@/components/ui/card";
import SparkyLoader from "@/components/loaders/sparky-loader";
import { AnalysisStatus } from "@/components/analysis-status";

export default function PlaygroundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-8">
      <Card className="">
        <CardContent className="">
          <div className="flex items-center gap-3 justify-center">
            <AgentsLoader scale={0.65} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
