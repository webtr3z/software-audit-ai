"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const AVAILABLE_MODELS = [
  {
    id: "claude-sonnet-4-5-20250929",
    name: "Claude Sonnet 4.5",
    description: "Más reciente y potente",
  },
  {
    id: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    description: "Más inteligente (si está disponible)",
  },
  {
    id: "claude-3-sonnet-20240229",
    name: "Claude 3 Sonnet",
    description: "Equilibrado",
  },
  {
    id: "claude-3-haiku-20240307",
    name: "Claude 3 Haiku",
    description: "Más rápido",
  },
];

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ModelSelector({
  value,
  onChange,
  disabled,
}: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="model-select" className="text-sm font-medium">
        Modelo de IA
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="model-select" className="w-full">
          <SelectValue placeholder="Selecciona un modelo" />
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_MODELS.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex flex-col items-start">
                <span className="font-medium">{model.name}</span>
                <span className="text-xs text-muted-foreground">
                  {model.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Cambia el modelo antes de iniciar el análisis
      </p>
    </div>
  );
}
