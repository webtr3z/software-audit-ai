"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Github, Loader2 } from "lucide-react";
import { createProject } from "@/lib/actions/projects";
import { useToast } from "@/hooks/use-toast";

export function GithubImportForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre para el proyecto",
        variant: "destructive",
      });
      return;
    }

    if (!githubUrl.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa una URL de GitHub",
        variant: "destructive",
      });
      return;
    }

    // Validate GitHub URL
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    if (!githubRegex.test(githubUrl.trim())) {
      toast({
        title: "Error",
        description:
          "Por favor ingresa una URL válida de GitHub (ej: https://github.com/usuario/repositorio)",
        variant: "destructive",
      });
      return;
    }

    // Validate GitHub token for private repos
    if (isPrivate && !githubToken.trim()) {
      toast({
        title: "Error",
        description:
          "Se requiere un token de acceso personal para repositorios privados",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("source_type", "github");
      formData.append("github_url", githubUrl);
      if (isPrivate && githubToken) {
        formData.append("github_token", githubToken);
      }

      const result = await createProject(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Proyecto creado",
        description: "Tu proyecto ha sido importado exitosamente desde GitHub",
      });

      router.push(`/dashboard/projects/${result.projectId}`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un error al importar el repositorio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="github-name">Nombre del Proyecto</Label>
        <Input
          id="github-name"
          placeholder="Mi Aplicación Web"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="github-description">Descripción (Opcional)</Label>
        <Textarea
          id="github-description"
          placeholder="Describe brevemente tu proyecto..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="github-url">URL del Repositorio de GitHub</Label>
        <Input
          id="github-url"
          type="url"
          placeholder="https://github.com/usuario/repositorio"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          Soporta repositorios públicos y privados (requiere token de acceso)
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is-private"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          <Label
            htmlFor="is-private"
            className="text-sm font-normal cursor-pointer"
          >
            Repositorio privado o de organización
          </Label>
        </div>
      </div>

      {isPrivate && (
        <div className="space-y-2">
          <Label htmlFor="github-token">Token de Acceso Personal (PAT)</Label>
          <Input
            id="github-token"
            type="password"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            required={isPrivate}
          />
          <p className="text-xs text-muted-foreground">
            Necesitas un{" "}
            <a
              href="https://github.com/settings/tokens/new?scopes=repo"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              token de acceso personal
            </a>{" "}
            con permisos de{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">repo</code>{" "}
            para acceder a repositorios privados
          </p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Importando Repositorio...
          </>
        ) : (
          <>
            <Github className="h-4 w-4 mr-2" />
            Importar y Analizar
          </>
        )}
      </Button>
    </form>
  );
}
