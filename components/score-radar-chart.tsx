"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ScoreRadarChartProps {
  scores: {
    security: number;
    codeQuality: number;
    performance: number;
    bugs: number;
    maintainability: number;
    architecture: number;
  };
}

export function ScoreRadarChart({ scores }: ScoreRadarChartProps) {
  const data = [
    {
      category: "Seguridad",
      score: scores.security,
      fullMark: 10,
    },
    {
      category: "Calidad",
      score: scores.codeQuality,
      fullMark: 10,
    },
    {
      category: "Rendimiento",
      score: scores.performance,
      fullMark: 10,
    },
    {
      category: "Bugs",
      score: scores.bugs,
      fullMark: 10,
    },
    {
      category: "Mantenibilidad",
      score: scores.maintainability,
      fullMark: 10,
    },
    {
      category: "Arquitectura",
      score: scores.architecture,
      fullMark: 10,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis por Categorías</CardTitle>
        <CardDescription>
          Visualización de puntuaciones en las 6 dimensiones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" />
            <PolarRadiusAxis angle={90} domain={[0, 10]} />
            <Radar
              name="Puntuación"
              dataKey="score"
              stroke="var(--color-primary)"
              fill="var(--color-primary)"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
