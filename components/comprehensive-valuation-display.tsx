import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  Users,
  Shield,
  FileText,
  BarChart3,
} from "lucide-react";

interface ComprehensiveValuationDisplayProps {
  valuation: any; // Will be properly typed from database
}

export function ComprehensiveValuationDisplay({
  valuation,
}: ComprehensiveValuationDisplayProps) {
  const isAsset = valuation.is_asset_or_liability === "asset";

  return (
    <div className="space-y-6">
      {/* Main Valuation Card */}
      <Card
        className={
          isAsset
            ? "border-primary/20 bg-primary/5"
            : "border-destructive/20 bg-destructive/5"
        }
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign
              className={`h-5 w-5 ${
                isAsset ? "text-primary" : "text-destructive"
              }`}
            />
            <CardTitle>Valoración Monetaria</CardTitle>
            <Badge variant={isAsset ? "default" : "destructive"}>
              {isAsset ? "Activo" : "Pasivo"}
            </Badge>
          </div>
          <CardDescription>
            Estimación del valor económico del software
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Values */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">
                Valor Estimado
              </div>
              <div
                className={`text-3xl font-bold ${
                  isAsset ? "text-primary" : "text-destructive"
                }`}
              >
                ${valuation.estimated_value.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Rango: ${valuation.min_value.toLocaleString()} - $
                {valuation.max_value.toLocaleString()}
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">
                Costo de Reconstrucción
              </div>
              <div className="text-2xl font-bold">
                $
                {valuation.cost_breakdown?.reconstructionCost?.toLocaleString() ||
                  0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {valuation.cost_breakdown?.developmentHours?.toLocaleString() ||
                  0}{" "}
                horas @ ${valuation.cost_breakdown?.averageHourlyRate || 0}/h
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">
                Nivel de Confianza
              </div>
              <div className="text-2xl font-bold">
                {Math.round(valuation.confidence_level * 100)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Región: {valuation.cost_breakdown?.region || "No especificada"}
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          {valuation.cost_breakdown && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Desglose de Costos
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Costo de Reconstrucción
                  </div>
                  <div className="text-lg font-semibold">
                    $
                    {valuation.cost_breakdown.reconstructionCost?.toLocaleString() ||
                      0}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Horas de Desarrollo
                  </div>
                  <div className="text-lg font-semibold">
                    {valuation.cost_breakdown.developmentHours?.toLocaleString() ||
                      0}
                    h
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Tarifa Promedio
                  </div>
                  <div className="text-lg font-semibold">
                    ${valuation.cost_breakdown.averageHourlyRate || 0}/hora
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Depreciation Factors */}
          {valuation.depreciation_factors && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                Factores de Depreciación
              </h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Depreciación por Edad
                  </div>
                  <div className="text-lg font-semibold text-destructive">
                    $
                    {valuation.depreciation_factors.ageDepreciation?.toLocaleString() ||
                      0}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Deuda Técnica
                  </div>
                  <div className="text-lg font-semibold text-destructive">
                    $
                    {valuation.depreciation_factors.technicalDebt?.toLocaleString() ||
                      0}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Factor de Obsolescencia
                  </div>
                  <div className="text-lg font-semibold">
                    {valuation.depreciation_factors.obsolescenceFactor?.toFixed(
                      2
                    ) || "0.00"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Multiplicador de Calidad
                  </div>
                  <div className="text-lg font-semibold">
                    {valuation.depreciation_factors.qualityMultiplier?.toFixed(
                      2
                    ) || "0.00"}
                    x
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Value Increments */}
          {valuation.value_increments && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Factores de Incremento de Valor
              </h4>
              <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Cobertura de Tests
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    +$
                    {valuation.value_increments.testCoverage?.toLocaleString() ||
                      0}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Documentación
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    +$
                    {valuation.value_increments.documentation?.toLocaleString() ||
                      0}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Seguridad</div>
                  <div className="text-lg font-semibold text-green-600">
                    +$
                    {valuation.value_increments.security?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Usuarios Activos
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    +$
                    {valuation.value_increments.activeUsers?.toLocaleString() ||
                      0}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Ingresos</div>
                  <div className="text-lg font-semibold text-green-600">
                    +$
                    {valuation.value_increments.revenue?.toLocaleString() || 0}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Annual Costs */}
          {valuation.annual_costs && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Costos Anuales
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Mantenimiento
                  </div>
                  <div className="text-lg font-semibold">
                    ${valuation.annual_costs.maintenance?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Infraestructura
                  </div>
                  <div className="text-lg font-semibold">
                    $
                    {valuation.annual_costs.infrastructure?.toLocaleString() ||
                      0}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Remediación de Deuda Técnica
                  </div>
                  <div className="text-lg font-semibold">
                    $
                    {valuation.annual_costs.technicalDebtRemediation?.toLocaleString() ||
                      0}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quality Metrics */}
          {valuation.quality_metrics && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Métricas de Calidad
              </h4>
              <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Calidad de Código
                  </div>
                  <div className="text-lg font-semibold">
                    {valuation.quality_metrics.codeQualityScore || 0}/10
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Cobertura de Tests
                  </div>
                  <div className="text-lg font-semibold">
                    {valuation.quality_metrics.testCoverage || 0}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Seguridad</div>
                  <div className="text-lg font-semibold">
                    {valuation.quality_metrics.securityScore || 0}/10
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Documentación
                  </div>
                  <div className="text-lg font-semibold">
                    {valuation.quality_metrics.documentationScore || 0}/10
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Índice de Mantenibilidad
                  </div>
                  <div className="text-lg font-semibold">
                    {valuation.quality_metrics.maintainabilityIndex || 0}/10
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Risk Factors */}
          {valuation.risk_factors && valuation.risk_factors.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Factores de Riesgo
              </h4>
              <div className="space-y-2">
                {valuation.risk_factors.map((risk: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-background rounded-lg border"
                  >
                    <Badge
                      variant={
                        risk.impact === "high"
                          ? "destructive"
                          : risk.impact === "medium"
                          ? "default"
                          : "secondary"
                      }
                      className="mt-0.5"
                    >
                      {risk.impact === "high"
                        ? "Alto"
                        : risk.impact === "medium"
                        ? "Medio"
                        : "Bajo"}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{risk.factor}</div>
                      <div className="text-xs text-muted-foreground">
                        {risk.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assumptions */}
          {valuation.assumptions && valuation.assumptions.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Supuestos de Valoración
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                {valuation.assumptions.map(
                  (assumption: string, idx: number) => (
                    <li key={idx}>{assumption}</li>
                  )
                )}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {valuation.recommendations &&
            valuation.recommendations.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Recomendaciones
                </h4>
                <ul className="space-y-2">
                  {valuation.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Comparable Projects */}
          {valuation.comparable_projects &&
            valuation.comparable_projects.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Proyectos Comparables
                </h4>
                <div className="space-y-2">
                  {valuation.comparable_projects.map(
                    (comp: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-background rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm">{comp.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {comp.description}
                            {comp.source && ` • ${comp.source}`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm">
                            ${comp.estimatedValue?.toLocaleString() || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round((comp.similarity || 0) * 100)}% similar
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Methodology & Notes */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Metodología</h4>
            <p className="text-sm text-muted-foreground">
              {valuation.methodology}
            </p>
            {valuation.notes && (
              <>
                <h4 className="font-semibold mb-2 mt-3">Notas Adicionales</h4>
                <p className="text-sm text-muted-foreground">
                  {valuation.notes}
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
