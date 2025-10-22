import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Github } from "lucide-react"
import { FileUploadForm } from "@/components/file-upload-form"
import { GithubImportForm } from "@/components/github-import-form"

export default function NewProjectPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Nuevo Proyecto</h2>
        <p className="text-muted-foreground">Sube archivos o importa desde GitHub para comenzar tu auditoría</p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Subir Archivos
          </TabsTrigger>
          <TabsTrigger value="github" className="gap-2">
            <Github className="h-4 w-4" />
            Importar desde GitHub
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Subir Archivos de Código</CardTitle>
              <CardDescription>
                Arrastra y suelta tus archivos o haz clic para seleccionarlos. Soporta múltiples archivos y carpetas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploadForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="github">
          <Card>
            <CardHeader>
              <CardTitle>Importar desde GitHub</CardTitle>
              <CardDescription>
                Ingresa la URL de tu repositorio público de GitHub para importar el código automáticamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GithubImportForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
