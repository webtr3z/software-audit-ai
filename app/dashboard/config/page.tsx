import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserConfigForm } from "@/components/user-config-form";
import { User, Brain, Bell, Shield } from "lucide-react";

export default async function ConfigPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Configuración</h2>
        <p className="text-muted-foreground">
          Administra tu perfil y preferencias de la aplicación
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil de Usuario
            </CardTitle>
            <CardDescription>
              Actualiza tu información personal y de contacto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserConfigForm
              userId={user.id}
              initialData={{
                email: user.email || "",
                fullName: profile?.full_name || "",
              }}
            />
          </CardContent>
        </Card>

        {/* AI Model Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Preferencias de IA
            </CardTitle>
            <CardDescription>
              Configura el modelo de IA predeterminado para análisis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Modelo Predeterminado
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Puedes cambiar el modelo por proyecto en la configuración de
                  cada proyecto.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Gestiona cómo y cuándo recibes notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Las notificaciones por correo electrónico están habilitadas
                  para análisis completados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seguridad de la Cuenta
            </CardTitle>
            <CardDescription>
              Administra la seguridad y privacidad de tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Correo Electrónico
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  {user.email}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Contraseña</label>
                <p className="text-sm text-muted-foreground mt-1">
                  Gestiona tu contraseña desde tu perfil de Supabase
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
