import { Badge } from "@/components/ui/badge";

interface ProjectScoreBadgeProps {
  score: number;
}

export function ProjectScoreBadge({ score }: ProjectScoreBadgeProps) {
  const getVariant = (score: number) => {
    if (score >= 8) return "default"; // Green
    if (score >= 6) return "secondary"; // Yellow
    return "destructive"; // Red
  };

  const getLabel = (score: number) => {
    if (score >= 8) return "Excelente";
    if (score >= 6) return "Bueno";
    return "Necesita mejoras";
  };

  return (
    <Badge variant={getVariant(score)} className="gap-1">
      <span className="font-semibold">{score}/10</span>
      <span className="hidden sm:inline">• {getLabel(score)}</span>
    </Badge>
  );
}
