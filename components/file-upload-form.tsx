"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, FileCode, Loader2 } from "lucide-react"
import { createProject } from "@/lib/actions/projects"
import { useToast } from "@/hooks/use-toast"

export function FileUploadForm() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    const codeFiles = droppedFiles.filter((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase()
      return ["js", "jsx", "ts", "tsx", "py", "java", "cpp", "c", "cs", "go", "rb", "php", "swift", "kt"].includes(
        ext || "",
      )
    })

    setFiles((prev) => [...prev, ...codeFiles])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...selectedFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre para el proyecto",
        variant: "destructive",
      })
      return
    }

    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Por favor sube al menos un archivo",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("source_type", "upload")

      files.forEach((file) => {
        formData.append("files", file)
      })

      const result = await createProject(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Proyecto creado",
        description: "Tu proyecto ha sido creado exitosamente",
      })

      router.push(`/dashboard/projects/${result.projectId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error al crear el proyecto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Proyecto</Label>
        <Input
          id="name"
          placeholder="Mi Aplicación Web"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción (Opcional)</Label>
        <Textarea
          id="description"
          placeholder="Describe brevemente tu proyecto..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Archivos de Código</Label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
        >
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-2">Arrastra y suelta archivos aquí, o</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            Seleccionar Archivos
          </Button>
          <input
            id="file-input"
            type="file"
            multiple
            accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.go,.rb,.php,.swift,.kt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Soporta: JS, TS, Python, Java, C++, C#, Go, Ruby, PHP, Swift, Kotlin
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <Label>Archivos Seleccionados ({files.length})</Label>
          <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-muted/50">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileCode className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creando Proyecto...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Crear Proyecto y Analizar
          </>
        )}
      </Button>
    </form>
  )
}
