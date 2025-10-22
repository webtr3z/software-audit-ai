"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import { FixSuggestionDialog } from "@/components/fix-suggestion-dialog"

interface Issue {
  id: string
  category: string
  severity: string
  title: string
  description: string
  file_path?: string
  line_number?: number
  code_snippet?: string
  suggested_fix?: string
  status: string
}

interface IssuesTableProps {
  issues: Issue[]
}

export function IssuesTable({ issues }: IssuesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch =
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.file_path?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = categoryFilter === "all" || issue.category === categoryFilter
      const matchesSeverity = severityFilter === "all" || issue.severity === severityFilter
      const matchesStatus = statusFilter === "all" || issue.status === statusFilter

      return matchesSearch && matchesCategory && matchesSeverity && matchesStatus
    })
  }, [issues, searchTerm, categoryFilter, severityFilter, statusFilter])

  const categoryNames: Record<string, string> = {
    security: "Seguridad",
    code_quality: "Calidad de Código",
    performance: "Rendimiento",
    bug: "Bug",
    maintainability: "Mantenibilidad",
    architecture: "Arquitectura",
  }

  const severityNames: Record<string, string> = {
    critical: "Crítico",
    high: "Alto",
    medium: "Medio",
    low: "Bajo",
    info: "Info",
  }

  const statusNames: Record<string, string> = {
    open: "Abierto",
    fixed: "Resuelto",
    ignored: "Ignorado",
    false_positive: "Falso Positivo",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos los Problemas ({filteredIssues.length})</CardTitle>
        <CardDescription>Filtra y busca problemas detectados en el análisis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar problemas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="security">Seguridad</SelectItem>
              <SelectItem value="code_quality">Calidad de Código</SelectItem>
              <SelectItem value="performance">Rendimiento</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="maintainability">Mantenibilidad</SelectItem>
              <SelectItem value="architecture">Arquitectura</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Severidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las severidades</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
              <SelectItem value="high">Alto</SelectItem>
              <SelectItem value="medium">Medio</SelectItem>
              <SelectItem value="low">Bajo</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="open">Abierto</SelectItem>
              <SelectItem value="fixed">Resuelto</SelectItem>
              <SelectItem value="ignored">Ignorado</SelectItem>
              <SelectItem value="false_positive">Falso Positivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Issues List */}
        <div className="space-y-3">
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue) => (
              <div key={issue.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{issue.title}</h4>
                      <Badge
                        variant={
                          issue.severity === "critical"
                            ? "destructive"
                            : issue.severity === "high"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {severityNames[issue.severity]}
                      </Badge>
                      <Badge variant="outline">{categoryNames[issue.category]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                  </div>
                </div>

                {issue.file_path && (
                  <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                    {issue.file_path}
                    {issue.line_number && `:${issue.line_number}`}
                  </div>
                )}

                {issue.code_snippet && (
                  <div className="bg-muted p-2 rounded">
                    <pre className="text-xs overflow-x-auto">{issue.code_snippet}</pre>
                  </div>
                )}

                {issue.suggested_fix && (
                  <div className="border-l-2 border-primary pl-3">
                    <div className="text-xs font-semibold mb-1">Solución Sugerida:</div>
                    <p className="text-xs text-muted-foreground">{issue.suggested_fix}</p>
                  </div>
                )}

                <div className="pt-2">
                  <FixSuggestionDialog
                    issue={{
                      id: issue.id,
                      title: issue.title,
                      description: issue.description,
                      category: issue.category,
                      severity: issue.severity,
                      file_path: issue.file_path,
                      line_number: issue.line_number,
                    }}
                    codeContext={issue.code_snippet || "// Código no disponible"}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No se encontraron problemas con los filtros aplicados</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
