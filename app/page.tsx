import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Shield, Code2, Zap, Bug, Wrench, Building2, DollarSign, FileSearch, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSearch className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">AuditCode AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Comenzar Gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-5xl font-bold text-balance">Auditoría de Código Impulsada por IA</h2>
          <p className="text-xl text-muted-foreground text-pretty">
            Analiza tu código en segundos. Identifica vulnerabilidades de seguridad, problemas de calidad y obtén una
            valoración monetaria precisa de tu software.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">
                Comenzar Ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Ver Características</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Análisis Completo en 6 Dimensiones</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Nuestra IA evalúa tu código desde múltiples perspectivas para brindarte una visión completa de su calidad y
            valor.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Seguridad</h4>
                  <p className="text-sm text-muted-foreground">
                    Detecta vulnerabilidades, inyecciones SQL, XSS y otros riesgos de seguridad críticos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Code2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Calidad de Código</h4>
                  <p className="text-sm text-muted-foreground">
                    Evalúa legibilidad, complejidad ciclomática y adherencia a mejores prácticas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Rendimiento</h4>
                  <p className="text-sm text-muted-foreground">
                    Identifica cuellos de botella, consultas lentas y oportunidades de optimización.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bug className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Detección de Bugs</h4>
                  <p className="text-sm text-muted-foreground">
                    Encuentra errores lógicos, condiciones de carrera y problemas potenciales antes de producción.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Wrench className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Mantenibilidad</h4>
                  <p className="text-sm text-muted-foreground">
                    Analiza documentación, modularidad y facilidad de mantenimiento del código.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Arquitectura</h4>
                  <p className="text-sm text-muted-foreground">
                    Evalúa patrones de diseño, separación de responsabilidades y escalabilidad.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Valuation Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-3xl font-bold">Valoración Monetaria Precisa</h3>
            <p className="text-lg text-muted-foreground">
              Obtén una estimación profesional del valor de tu software basada en complejidad, calidad, líneas de
              código, tecnologías utilizadas y comparables de mercado.
            </p>
            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">$50K-$500K</div>
                <p className="text-sm text-muted-foreground">Rango de valoración típico</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">{"<"}30s</div>
                <p className="text-sm text-muted-foreground">Tiempo de análisis</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">95%</div>
                <p className="text-sm text-muted-foreground">Nivel de confianza</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h3 className="text-3xl font-bold">¿Listo para auditar tu código?</h3>
          <p className="text-lg text-muted-foreground">
            Únete a cientos de desarrolladores que ya confían en AuditCode AI para mejorar la calidad y seguridad de su
            software.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/sign-up">
              Comenzar Gratis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 AuditCode AI. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
