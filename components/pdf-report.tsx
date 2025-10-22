import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  coverPage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5E6FF", // Bubblegum theme light pink
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#9333EA", // Bubblegum theme primary
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: "#64748B",
    marginBottom: 10,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#9333EA",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  scoreText: {
    fontSize: 48,
    color: "#ffffff",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#9333EA",
    marginBottom: 12,
    borderBottom: "2 solid #E9D5FF",
    paddingBottom: 6,
  },
  text: {
    fontSize: 11,
    color: "#334155",
    marginBottom: 6,
    lineHeight: 1.5,
  },
  label: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "bold",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  column: {
    flex: 1,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: "#475569",
    flex: 1,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#9333EA",
  },
  issueBox: {
    marginBottom: 10,
    padding: 12,
    backgroundColor: "#FEF2F2",
    borderLeft: "3 solid #EF4444",
    borderRadius: 4,
  },
  issueTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#DC2626",
    marginBottom: 4,
  },
  issueDescription: {
    fontSize: 10,
    color: "#64748B",
    marginBottom: 4,
  },
  valuationBox: {
    padding: 15,
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    marginTop: 10,
  },
  valuationAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 8,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 9,
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 40,
    color: "#94A3B8",
    fontSize: 9,
  },
});

interface PDFReportProps {
  project: any;
  analysis: any;
  valuation: any;
  issues: any[];
}

export function PDFReport({
  project,
  analysis,
  valuation,
  issues,
}: PDFReportProps) {
  const overallScore = analysis.overall_score;
  const criticalIssues = issues.filter((i) => i.severity === "critical").length;
  const highIssues = issues.filter((i) => i.severity === "high").length;
  const mediumIssues = issues.filter((i) => i.severity === "medium").length;

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.title}>Auditoría de Software</Text>
        <Text style={styles.subtitle}>{project.name}</Text>
        <Text style={{ fontSize: 12, color: "#64748B", marginTop: 10 }}>
          {new Date(analysis.created_at).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreText}>{overallScore}</Text>
          <Text style={{ color: "#ffffff", fontSize: 14 }}>/100</Text>
        </View>
        <Text style={{ fontSize: 14, color: "#64748B", marginTop: 20 }}>
          Puntuación General
        </Text>
      </Page>

      {/* Executive Summary */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Resumen Ejecutivo</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Descripción del Proyecto</Text>
          <Text style={styles.text}>
            {project.description || "Sin descripción"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Estadísticas del Código</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.text}>Archivos: {project.file_count}</Text>
              <Text style={styles.text}>
                Líneas de código: {project.total_lines?.toLocaleString()}
              </Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.text}>
                Lenguajes: {project.languages?.join(", ") || "N/A"}
              </Text>
              <Text style={styles.text}>
                Modelo AI: {analysis.ai_model || "claude-sonnet-4-5"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Problemas Encontrados</Text>
          <Text style={styles.text}>
            🔴 Críticos: {criticalIssues} | 🟠 Altos: {highIssues} | 🟡 Medios:{" "}
            {mediumIssues}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Resumen de Calidad</Text>
          <Text style={styles.text}>{analysis.summary}</Text>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber }) => `${pageNumber}`}
          fixed
        />
      </Page>

      {/* Detailed Scores */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Puntuaciones Detalladas</Text>

        <View style={styles.section}>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>🛡️ Seguridad</Text>
            <Text style={styles.scoreValue}>{analysis.security_score}/10</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>✨ Calidad de Código</Text>
            <Text style={styles.scoreValue}>
              {analysis.code_quality_score}/10
            </Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>⚡ Rendimiento</Text>
            <Text style={styles.scoreValue}>
              {analysis.performance_score}/10
            </Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>🐛 Detección de Bugs</Text>
            <Text style={styles.scoreValue}>{analysis.bugs_score}/10</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>🔧 Mantenibilidad</Text>
            <Text style={styles.scoreValue}>
              {analysis.maintainability_score}/10
            </Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>🏗️ Arquitectura</Text>
            <Text style={styles.scoreValue}>
              {analysis.architecture_score}/10
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Nivel de Confianza</Text>
          <Text style={styles.text}>{analysis.confidence_level}%</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Tiempo de Análisis</Text>
          <Text style={styles.text}>
            {analysis.analysis_duration_seconds} segundos
          </Text>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber }) => `${pageNumber}`}
          fixed
        />
      </Page>

      {/* Issues */}
      {criticalIssues + highIssues > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>
            Problemas Críticos y de Alta Prioridad
          </Text>

          {issues
            .filter(
              (issue) =>
                issue.severity === "critical" || issue.severity === "high"
            )
            .slice(0, 10)
            .map((issue, index) => (
              <View key={index} style={styles.issueBox}>
                <Text style={styles.issueTitle}>
                  {issue.severity === "critical" ? "🔴" : "🟠"} {issue.title}
                </Text>
                <Text style={styles.issueDescription}>{issue.description}</Text>
                <Text style={{ fontSize: 9, color: "#94A3B8" }}>
                  {issue.file_path}:{issue.line_number || "N/A"}
                </Text>
              </View>
            ))}

          {criticalIssues + highIssues > 10 && (
            <Text style={styles.text}>
              ... y {criticalIssues + highIssues - 10} problemas más
            </Text>
          )}

          <Text
            style={styles.pageNumber}
            render={({ pageNumber }) => `${pageNumber}`}
            fixed
          />
        </Page>
      )}

      {/* Valuation */}
      {valuation && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Valoración del Proyecto</Text>

          <View style={styles.valuationBox}>
            <Text style={styles.label}>Valor Estimado</Text>
            <Text style={styles.valuationAmount}>
              ${valuation.estimated_value?.toLocaleString()} USD
            </Text>
            <Text style={styles.text}>
              Rango: ${valuation.min_value?.toLocaleString()} - $
              {valuation.max_value?.toLocaleString()} USD
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Desglose de Costos</Text>
            <Text style={styles.text}>
              💻 Costo de Desarrollo: $
              {valuation.development_cost?.toLocaleString()} USD
            </Text>
            <Text style={styles.text}>
              🔧 Costo de Mantenimiento: $
              {valuation.maintenance_cost?.toLocaleString()} USD/año
            </Text>
            <Text style={styles.text}>
              ☁️ Costo de Infraestructura: $
              {valuation.infrastructure_cost?.toLocaleString()} USD/año
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Factores de Valoración</Text>
            <Text style={styles.text}>
              Complejidad: {(valuation.complexity_factor * 100).toFixed(0)}%
            </Text>
            <Text style={styles.text}>
              Calidad: {(valuation.quality_factor * 100).toFixed(0)}%
            </Text>
            <Text style={styles.text}>
              Mercado: {(valuation.market_factor * 100).toFixed(0)}%
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Metodología</Text>
            <Text style={styles.text}>{valuation.methodology}</Text>
          </View>

          {valuation.notes && (
            <View style={styles.section}>
              <Text style={styles.label}>Notas</Text>
              <Text style={styles.text}>{valuation.notes}</Text>
            </View>
          )}

          <Text
            style={styles.pageNumber}
            render={({ pageNumber }) => `${pageNumber}`}
            fixed
          />
        </Page>
      )}

      {/* Recommendations */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Recomendaciones</Text>

        {analysis.recommendations &&
          JSON.parse(analysis.recommendations)
            .slice(0, 8)
            .map((rec: any, index: number) => (
              <View key={index} style={{ marginBottom: 12 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "bold",
                    color: "#334155",
                    marginBottom: 4,
                  }}
                >
                  {index + 1}. {rec.title || rec}
                </Text>
                {rec.description && (
                  <Text style={styles.text}>{rec.description}</Text>
                )}
              </View>
            ))}

        <View
          style={{
            marginTop: 30,
            padding: 15,
            backgroundColor: "#F1F5F9",
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 10, color: "#64748B", textAlign: "center" }}>
            Este reporte fue generado automáticamente por el sistema de
            auditoría de software.
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: "#64748B",
              textAlign: "center",
              marginTop: 4,
            }}
          >
            Para más información, consulta el dashboard completo en la
            plataforma.
          </Text>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber }) => `${pageNumber}`}
          fixed
        />
      </Page>
    </Document>
  );
}
