"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { updateProjectConfig } from "@/lib/actions/projects";
import { Loader2, Save, Info } from "lucide-react";

interface ModelConfigFormProps {
  projectId: string;
  currentConfig: {
    ai_model?: string;
    max_tokens?: number;
    temperature?: number;
    analysis_config?: {
      retry_attempts?: number;
      timeout_minutes?: number;
    };
  };
}

const AI_MODELS = [
  {
    value: "claude-sonnet-4-5-20250929",
    label: "Claude Sonnet 4.5 (Recomendado)",
    description: "Equilibrio ideal entre velocidad y calidad",
  },
  {
    value: "claude-opus-4-20250514",
    label: "Claude Opus 4",
    description: "Máxima calidad y precisión",
  },
  {
    value: "claude-3-5-sonnet-20241022",
    label: "Claude 3.5 Sonnet",
    description: "Versión anterior, más económica",
  },
];

export function ModelConfigForm({
  projectId,
  currentConfig,
}: ModelConfigFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState({
    ai_model: currentConfig.ai_model || "claude-sonnet-4-5-20250929",
    max_tokens: currentConfig.max_tokens || 16384,
    temperature: currentConfig.temperature || 1.0,
    retry_attempts: currentConfig.analysis_config?.retry_attempts || 2,
    timeout_minutes: currentConfig.analysis_config?.timeout_minutes || 10,
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await updateProjectConfig(projectId, {
        ai_model: config.ai_model,
        max_tokens: config.max_tokens,
        temperature: config.temperature,
        analysis_config: {
          retry_attempts: config.retry_attempts,
          timeout_minutes: config.timeout_minutes,
        },
      });

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Configuración guardada",
          description: "Los cambios se aplicarán en el próximo análisis",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Modelo de IA</CardTitle>
          <CardDescription>
            Selecciona el modelo de Claude que se utilizará para el análisis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai_model">Modelo</Label>
            <Select
              value={config.ai_model}
              onValueChange={(value) =>
                setConfig({ ...config, ai_model: value })
              }
            >
              <SelectTrigger id="ai_model" className="">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{model.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {model.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_tokens">Tokens Máximos por Llamada</Label>
            <Input
              id="max_tokens"
              type="number"
              min={4096}
              max={200000}
              step={1024}
              value={config.max_tokens}
              onChange={(e) =>
                setConfig({ ...config, max_tokens: parseInt(e.target.value) })
              }
            />
            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Controla la longitud de las respuestas del análisis. Valores más
                altos permiten análisis más detallados pero consumen más tokens.
                <strong> Recomendado: 16384 o superior</strong> para análisis
                completos.
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="temperature">Temperatura</Label>
            <Input
              id="temperature"
              type="number"
              min={0}
              max={2}
              step={0.1}
              value={config.temperature}
              onChange={(e) =>
                setConfig({
                  ...config,
                  temperature: parseFloat(e.target.value),
                })
              }
            />
            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Controla la creatividad del modelo. 1.0 es balanceado, valores
                más bajos son más determinísticos, valores más altos son más
                creativos.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración Avanzada</CardTitle>
          <CardDescription>
            Ajusta parámetros adicionales del análisis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="retry_attempts">Intentos de Reintento</Label>
            <Input
              id="retry_attempts"
              type="number"
              min={0}
              max={5}
              value={config.retry_attempts}
              onChange={(e) =>
                setConfig({
                  ...config,
                  retry_attempts: parseInt(e.target.value),
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Número de veces que se reintentará si falla el análisis
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeout_minutes">Tiempo Máximo (minutos)</Label>
            <Input
              id="timeout_minutes"
              type="number"
              min={5}
              max={60}
              value={config.timeout_minutes}
              onChange={(e) =>
                setConfig({
                  ...config,
                  timeout_minutes: parseInt(e.target.value),
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Tiempo máximo de espera para el análisis completo
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Configuración
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
