import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  const errorInfo = params?.error
    ? {
        title: "Lo sentimos, algo salió mal",
        description: `Ocurrió un error inesperado. ${
          params.error ? `Código de error: ${params.error}` : ""
        }`,
      }
    : {
        title: "Lo sentimos, algo salió mal",
        description: "Ocurrió un error no especificado.",
      };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{errorInfo.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {errorInfo.description}
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Volver al inicio de sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
