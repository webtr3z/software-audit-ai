"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

interface UserConfigFormProps {
  userId: string;
  initialData: {
    email: string;
    fullName: string;
  };
}

export function UserConfigForm({ userId, initialData }: UserConfigFormProps) {
  const [fullName, setFullName] = useState(initialData.fullName);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          fullName,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el perfil");
      }

      toast({
        title: "✅ Perfil actualizado",
        description: "Tus cambios se han guardado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input
          id="email"
          type="email"
          value={initialData.email}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          El correo electrónico no se puede modificar
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre Completo</Label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Tu nombre completo"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={isSaving || fullName === initialData.fullName}
      >
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? "Guardando..." : "Guardar Cambios"}
      </Button>
    </form>
  );
}
