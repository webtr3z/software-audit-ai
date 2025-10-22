import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">¡Gracias por registrarte!</CardTitle>
            <CardDescription>Verifica tu correo electrónico para continuar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Te hemos enviado un correo de confirmación. Por favor, revisa tu bandeja de entrada y haz clic en el
              enlace para activar tu cuenta.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Volver al inicio de sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
