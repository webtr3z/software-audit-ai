"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Save, RotateCcw, FileCode, AlertCircle } from "lucide-react";
import type { PromptType } from "@/lib/ai/prompt-service";
import dynamic from "next/dynamic";

// Dynamically import code editor to avoid SSR issues
const Editor = dynamic(
  () => import("react-simple-code-editor").then((mod) => mod.default),
  { ssr: false }
);

// Import Prism for syntax highlighting
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-json";
import "prismjs/themes/prism-tomorrow.css";

interface PromptEditorProps {
  initialPrompts: Record<PromptType, string>;
}

type SyntaxLanguage =
  | "markdown"
  | "javascript"
  | "typescript"
  | "jsx"
  | "tsx"
  | "json";

export function PromptEditor({ initialPrompts }: PromptEditorProps) {
  const [selectedType, setSelectedType] = useState<PromptType>("security");
  const [promptContent, setPromptContent] = useState<string>(
    initialPrompts[selectedType] || ""
  );
  const [syntaxLanguage, setSyntaxLanguage] =
    useState<SyntaxLanguage>("markdown");
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const { toast } = useToast();

  const promptTypes: Array<{ value: PromptType; label: string }> = [
    { value: "security", label: "🛡️ Seguridad" },
    { value: "code_quality", label: "✨ Calidad de Código" },
    { value: "performance", label: "⚡ Rendimiento" },
    { value: "bugs", label: "🐛 Detección de Bugs" },
    { value: "maintainability", label: "🔧 Mantenibilidad" },
    { value: "architecture", label: "🏗️ Arquitectura" },
    { value: "valuation", label: "💰 Valoración" },
  ];

  const syntaxLanguages: Array<{ value: SyntaxLanguage; label: string }> = [
    { value: "markdown", label: "Markdown" },
    { value: "json", label: "JSON" },
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "jsx", label: "JSX" },
    { value: "tsx", label: "TSX" },
  ];

  const handleTypeChange = (value: string) => {
    if (isDirty) {
      const confirm = window.confirm(
        "Tienes cambios sin guardar. ¿Deseas continuar sin guardar?"
      );
      if (!confirm) return;
    }

    setSelectedType(value as PromptType);
    setPromptContent(initialPrompts[value as PromptType] || "");
    setIsDirty(false);
  };

  const handleContentChange = (value: string) => {
    setPromptContent(value);
    setIsDirty(value !== initialPrompts[selectedType]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/prompts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptType: selectedType,
          promptContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar");
      }

      // Update initial prompts
      initialPrompts[selectedType] = promptContent;
      setIsDirty(false);

      toast({
        title: "✅ Prompt guardado",
        description: "El prompt personalizado se ha guardado correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el prompt",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    const confirm = window.confirm(
      "¿Estás seguro de que deseas restaurar el prompt predeterminado? Esta acción no se puede deshacer."
    );

    if (!confirm) return;

    setIsResetting(true);
    try {
      const response = await fetch("/api/prompts/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptType: selectedType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al resetear");
      }

      // Update with default prompt
      if (data.defaultPrompt) {
        setPromptContent(data.defaultPrompt);
        initialPrompts[selectedType] = data.defaultPrompt;
        setIsDirty(false);
      }

      toast({
        title: "✅ Prompt restaurado",
        description: "Se ha restaurado el prompt predeterminado",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo resetear el prompt",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const characterCount = promptContent.length;
  const maxCharacters = 10000;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              Editor de Prompts de IA
            </CardTitle>
            <CardDescription>
              Personaliza los prompts que usa el sistema de análisis. Los
              cambios afectarán los nuevos análisis.
            </CardDescription>
          </div>
          <Badge variant="secondary">Avanzado</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Tipo de Análisis
          </label>
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {promptTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">
                Contenido del Prompt
              </label>
              <Select
                value={syntaxLanguage}
                onValueChange={(value) =>
                  setSyntaxLanguage(value as SyntaxLanguage)
                }
              >
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {syntaxLanguages.map((lang) => (
                    <SelectItem
                      key={lang.value}
                      value={lang.value}
                      className="text-xs"
                    >
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span
                className={
                  isOverLimit
                    ? "text-destructive font-medium"
                    : "text-muted-foreground"
                }
              >
                {characterCount.toLocaleString()} /{" "}
                {maxCharacters.toLocaleString()} caracteres
              </span>
              {isDirty && (
                <Badge variant="outline" className="text-xs">
                  Sin guardar
                </Badge>
              )}
            </div>
          </div>
          <div className="border rounded-md overflow-hidden bg-[#2d2d2d]">
            <Editor
              value={promptContent}
              onValueChange={(code) => handleContentChange(code)}
              highlight={(code) => {
                try {
                  const lang = languages[syntaxLanguage];
                  return lang ? highlight(code, lang, syntaxLanguage) : code;
                } catch (e) {
                  return code;
                }
              }}
              padding={16}
              style={{
                fontFamily: '"Fira Code", "Fira Mono", monospace',
                fontSize: 13,
                minHeight: "500px",
                backgroundColor: "#2d2d2d",
              }}
              placeholder="Escribe tu prompt personalizado aquí..."
            />
          </div>
          {isOverLimit && (
            <div className="flex items-center gap-2 mt-2 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              <span>El prompt excede el límite de caracteres permitidos</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Este prompt se enviará a Claude para realizar el análisis. Asegúrate
            de mantener el formato JSON esperado en la respuesta según el tipo
            de análisis.
          </p>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={isSaving || !isDirty || isOverLimit}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isResetting}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {isResetting ? "Restaurando..." : "Restaurar Predeterminado"}
          </Button>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">💡 Consejos</h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>
              Usa el selector de lenguaje para resaltado de sintaxis (Markdown,
              JSON, JS, TS, JSX, TSX)
            </li>
            <li>Mantén las instrucciones claras y específicas</li>
            <li>
              Especifica el formato de salida esperado (JSON, estructura,
              campos)
            </li>
            <li>Incluye ejemplos si es necesario para mayor claridad</li>
            <li>Los prompts personalizados solo afectan nuevos análisis</li>
            <li>
              Puedes restaurar el prompt predeterminado en cualquier momento
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
