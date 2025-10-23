import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Shield,
  Code2,
  Zap,
  Bug,
  Wrench,
  Building2,
  DollarSign,
  Calculator,
  Target,
} from "lucide-react";

export default async function MethodologyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Verify report exists
  const { data: report } = await supabase
    .from("consolidated_reports")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (!report) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="h-10 w-10" />
          Metodología de Auditoría
        </h1>
        <p className="text-muted-foreground">
          Documentación completa del proceso de análisis y valoración
        </p>
      </div>

      {/* Audit Approach */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Enfoque de Auditoría
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Análisis Impulsado por IA</h3>
            <p className="text-sm text-muted-foreground">
              El sistema utiliza Claude (Anthropic) como modelo de lenguaje
              avanzado para analizar el código fuente. El análisis se realiza
              en múltiples categorías independientes, cada una enfocada en
              aspectos específicos de calidad y seguridad del código.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Categorías de Análisis</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-1" />
                <div>
                  <div className="font-medium text-sm">Seguridad</div>
                  <p className="text-xs text-muted-foreground">
                    Vulnerabilidades, exposición de datos, autenticación
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Code2 className="h-4 w-4 text-primary mt-1" />
                <div>
                  <div className="font-medium text-sm">Calidad de Código</div>
                  <p className="text-xs text-muted-foreground">
                    Complejidad, duplicación, estándares
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-primary mt-1" />
                <div>
                  <div className="font-medium text-sm">Rendimiento</div>
                  <p className="text-xs text-muted-foreground">
                    Eficiencia algorítmica, uso de recursos
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Bug className="h-4 w-4 text-primary mt-1" />
                <div>
                  <div className="font-medium text-sm">Detección de Bugs</div>
                  <p className="text-xs text-muted-foreground">
                    Errores lógicos, casos edge, manejo de errores
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Wrench className="h-4 w-4 text-primary mt-1" />
                <div>
                  <div className="font-medium text-sm">Mantenibilidad</div>
                  <p className="text-xs text-muted-foreground">
                    Documentación, testabilidad, modularidad
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-primary mt-1" />
                <div>
                  <div className="font-medium text-sm">Arquitectura</div>
                  <p className="text-xs text-muted-foreground">
                    Patrones de diseño, escalabilidad, separación de
                    responsabilidades
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Formulas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Fórmulas de Puntuación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Puntuación General</h3>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              Puntuación General = (Seguridad + Calidad + Rendimiento + Bugs +
              Mantenibilidad + Arquitectura) / 6
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              La puntuación general es el promedio simple de las seis
              categorías de análisis.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Escala de Puntuación</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-20 text-sm font-medium">0-10</div>
                <div className="text-sm text-muted-foreground">
                  Cada categoría se puntúa en una escala de 0 a 10
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 text-sm font-medium">8-10</div>
                <div className="text-sm text-muted-foreground">Excelente</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 text-sm font-medium">6-7.9</div>
                <div className="text-sm text-muted-foreground">Bueno</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 text-sm font-medium">4-5.9</div>
                <div className="text-sm text-muted-foreground">Aceptable</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 text-sm font-medium">0-3.9</div>
                <div className="text-sm text-muted-foreground">
                  Necesita Mejoras
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Nivel de Confianza</h3>
            <p className="text-sm text-muted-foreground">
              El nivel de confianza indica qué tan seguro está el sistema sobre
              el análisis, basado en factores como la cantidad de código
              analizado, la complejidad del proyecto y la claridad de los
              patrones detectados.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Valuation Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Criterios de Valoración
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Costo de Reconstrucción</h3>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              Costo = Líneas de Código × Factor de Complejidad × Tarifa Horaria
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              El costo base se calcula estimando las horas necesarias para
              reconstruir el proyecto desde cero, considerando la complejidad
              del código y las tarifas de mercado según la región y tecnologías
              utilizadas.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Costos Anuales</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-medium text-foreground">•</span>
                <span>
                  <strong>Mantenimiento:</strong> Costo anual estimado de
                  mantenimiento y actualizaciones (10-20% del costo de
                  desarrollo)
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">•</span>
                <span>
                  <strong>Infraestructura:</strong> Costos de hosting,
                  servicios en la nube, bases de datos y APIs externas
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">•</span>
                <span>
                  <strong>Deuda Técnica:</strong> Costo estimado de remediar
                  problemas de calidad, seguridad y rendimiento detectados
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Factores de Depreciación</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-medium text-foreground">•</span>
                <span>
                  <strong>Edad del Código:</strong> El código más antiguo se
                  deprecia debido a tecnologías obsoletas
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">•</span>
                <span>
                  <strong>Deuda Técnica:</strong> Problemas detectados reducen
                  el valor del proyecto
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">•</span>
                <span>
                  <strong>Obsolescencia:</strong> Uso de frameworks,
                  librerías o patrones obsoletos
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">•</span>
                <span>
                  <strong>Multiplicador de Calidad:</strong> Proyectos con
                  puntuaciones altas reciben un multiplicador positivo
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Clasificación</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong className="text-foreground">Activo:</strong>{" "}
                <span className="text-muted-foreground">
                  Proyecto con buena calidad, bajo mantenimiento requerido, y
                  potencial de generar valor
                </span>
              </div>
              <div>
                <strong className="text-foreground">Pasivo:</strong>{" "}
                <span className="text-muted-foreground">
                  Proyecto que requiere inversión significativa para corregir
                  problemas o que tiene costos de mantenimiento altos
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Criteria per Category */}
      <Card>
        <CardHeader>
          <CardTitle>Criterios de Puntuación por Categoría</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Security */}
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-primary" />
              Seguridad
            </h3>
            <ul className="space-y-1 text-sm text-muted-foreground ml-6">
              <li>• Vulnerabilidades conocidas (SQL injection, XSS, CSRF)</li>
              <li>• Problemas de autenticación y autorización</li>
              <li>• Exposición de datos sensibles</li>
              <li>• Uso inseguro de criptografía</li>
              <li>• Validación y sanitización de entrada</li>
              <li>• Gestión de secretos y credenciales</li>
            </ul>
          </div>

          {/* Code Quality */}
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Code2 className="h-4 w-4 text-primary" />
              Calidad de Código
            </h3>
            <ul className="space-y-1 text-sm text-muted-foreground ml-6">
              <li>• Complejidad ciclomática</li>
              <li>• Duplicación de código</li>
              <li>• Convenciones de nomenclatura</li>
              <li>• Cumplimiento de estándares de código</li>
              <li>• Consistencia del estilo</li>
              <li>• Uso de mejores prácticas del lenguaje</li>
            </ul>
          </div>

          {/* Performance */}
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary" />
              Rendimiento
            </h3>
            <ul className="space-y-1 text-sm text-muted-foreground ml-6">
              <li>• Eficiencia algorítmica</li>
              <li>• Uso de recursos (memoria, CPU)</li>
              <li>• Estrategias de caching</li>
              <li>• Problemas N+1 en consultas</li>
              <li>• Lazy loading y optimizaciones</li>
              <li>• Gestión de conexiones y pools</li>
            </ul>
          </div>

          {/* Bugs */}
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Bug className="h-4 w-4 text-primary" />
              Detección de Bugs
            </h3>
            <ul className="space-y-1 text-sm text-muted-foreground ml-6">
              <li>• Errores lógicos</li>
              <li>• Casos edge no manejados</li>
              <li>• Manejo inadecuado de errores</li>
              <li>• Null pointer / undefined references</li>
              <li>• Race conditions</li>
              <li>• Memory leaks</li>
            </ul>
          </div>

          {/* Maintainability */}
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Wrench className="h-4 w-4 text-primary" />
              Mantenibilidad
            </h3>
            <ul className="space-y-1 text-sm text-muted-foreground ml-6">
              <li>• Calidad de documentación</li>
              <li>• Cobertura de pruebas</li>
              <li>• Modularidad y cohesión</li>
              <li>• Legibilidad del código</li>
              <li>• Dependencias y acoplamiento</li>
              <li>• Facilidad para agregar nuevas features</li>
            </ul>
          </div>

          {/* Architecture */}
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-primary" />
              Arquitectura
            </h3>
            <ul className="space-y-1 text-sm text-muted-foreground ml-6">
              <li>• Patrones de diseño apropiados</li>
              <li>• Separación de responsabilidades</li>
              <li>• Escalabilidad horizontal y vertical</li>
              <li>• Gestión de dependencias</li>
              <li>• Estructura de capas</li>
              <li>• Principios SOLID</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-muted">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Descargo de Responsabilidad:</strong> Este análisis es una
            evaluación automatizada basada en IA y debe ser revisado por
            profesionales calificados antes de tomar decisiones críticas de
            negocio o técnicas. Los valores de valoración son estimaciones
            basadas en metodologías estándar de la industria y pueden variar
            según el contexto específico del proyecto y el mercado.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

