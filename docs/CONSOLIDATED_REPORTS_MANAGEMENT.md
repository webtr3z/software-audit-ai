# Gestión de Reportes Consolidados

Esta documentación describe la funcionalidad de gestión de reportes consolidados en la página de **Analítica**.

---

## 📋 Descripción General

Los usuarios ahora pueden:

1. ✅ Ver todos los reportes consolidados que han generado
2. ✅ Acceder a reportes existentes con un clic
3. ✅ Copiar enlaces públicos para compartir
4. ✅ Eliminar reportes antiguos o no deseados
5. ✅ Generar nuevos reportes desde la misma página

---

## 🎯 Ubicación

**Ruta:** `/dashboard/analytics`

**Navegación:** Dashboard → Analítica

---

## 🖼️ Interfaz de Usuario

### Sección de Reportes Consolidados

Ubicada en la parte superior de la página de Analítica, muestra:

#### Cuando NO hay reportes:

```
┌─────────────────────────────────────────────┐
│ 📄 Reportes Consolidados                    │
│ Aún no has generado ningún reporte          │
├─────────────────────────────────────────────┤
│                                             │
│          📝 [Icono Grande]                  │
│                                             │
│   Selecciona proyectos de la tabla de      │
│   abajo y genera tu primer reporte          │
│   consolidado para ver análisis             │
│   combinados y métricas generales.          │
│                                             │
└─────────────────────────────────────────────┘
```

#### Cuando HAY reportes:

```
┌─────────────────────────────────────────────────────────────┐
│ 📄 Reportes Consolidados                                    │
│ 3 reportes generados                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 📄 Reporte Consolidado de Auditoría (3 Proyectos) [Público]│
│    Análisis combinado de Project A, Project B, Project C.  │
│    📅 15 de enero de 2025  📁 3 proyectos                  │
│                               [Ver] [📋] [🗑️]              │
│                                                             │
│ 📄 Reporte Q4 2024 (2 Proyectos) [Público]                 │
│    Auditoría trimestral de sistemas internos.              │
│    📅 30 de diciembre de 2024  📁 2 proyectos              │
│                               [Ver] [📋] [🗑️]              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Funcionalidades

### 1. Ver Reporte

**Botón:** `Ver` con icono de enlace externo

**Acción:**

- Abre el reporte consolidado en una nueva pestaña
- URL pública: `/reports/{slug}`
- No requiere autenticación (reporte público)

**Ejemplo:**

```typescript
<Link href={`/reports/${report.slug}`} target="_blank">
  Ver
</Link>
```

---

### 2. Copiar Enlace

**Botón:** Icono de portapapeles

**Acción:**

- Copia la URL pública del reporte al portapapeles
- Muestra notificación de éxito
- Permite compartir fácilmente con otros

**URL generada:**

```
https://tudominio.com/reports/reporte-consolidado-de-auditoria-3-proyectos
```

**Implementación:**

```typescript
const handleCopyLink = (slug: string) => {
  const url = `${window.location.origin}/reports/${slug}`;
  navigator.clipboard.writeText(url);
  toast({
    title: "✅ Enlace copiado",
    description: "El enlace del reporte se copió al portapapeles",
  });
};
```

---

### 3. Eliminar Reporte

**Botón:** Icono de papelera (rojo)

**Acción:**

- Muestra diálogo de confirmación
- Elimina el reporte permanentemente
- El enlace público deja de funcionar
- Actualiza la lista automáticamente

**Diálogo de Confirmación:**

```
┌──────────────────────────────────────────┐
│ ⚠️  ¿Eliminar reporte consolidado?       │
├──────────────────────────────────────────┤
│ Esta acción no se puede deshacer.        │
│ El reporte será eliminado                │
│ permanentemente y el enlace público      │
│ dejará de funcionar.                     │
├──────────────────────────────────────────┤
│              [Cancelar]  [Eliminar]      │
└──────────────────────────────────────────┘
```

**Seguridad:**

- Verifica que el usuario sea el propietario
- Devuelve error 403 si no tiene permisos
- Registra la eliminación en logs

---

## 🗂️ Información Mostrada

Para cada reporte se muestra:

### 📊 Datos Principales

1. **Título del reporte**

   - Ejemplo: "Reporte Consolidado de Auditoría (3 Proyectos)"

2. **Descripción** (opcional)

   - Ejemplo: "Análisis combinado de Project A, Project B, Project C."

3. **Badge de visibilidad**
   - `[Público]` si `is_public = true`

### 📅 Metadatos

4. **Fecha de creación**

   - Formato: "15 de enero de 2025"
   - Icono: 📅

5. **Número de proyectos**
   - Formato: "3 proyectos"
   - Icono: 📁

---

## 🛠️ Implementación Técnica

### Archivos Creados/Modificados

#### 1. `components/consolidated-reports-list.tsx`

**Tipo:** Client Component

**Responsabilidades:**

- Renderizar la lista de reportes
- Manejar acciones (ver, copiar, eliminar)
- Mostrar estado vacío
- Gestionar estados de carga

**Props:**

```typescript
interface ConsolidatedReportsListProps {
  reports: ConsolidatedReport[];
}

interface ConsolidatedReport {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  project_ids: string[];
  created_at: string;
  is_public: boolean;
}
```

**Hooks utilizados:**

- `useState` - Para estado de eliminación
- `useToast` - Para notificaciones
- `useRouter` - Para refresh después de eliminar

#### 2. `app/api/reports/delete/route.ts`

**Tipo:** API Route (DELETE)

**Endpoint:** `/api/reports/delete`

**Request Body:**

```json
{
  "reportId": "uuid-del-reporte"
}
```

**Validaciones:**

1. Usuario autenticado
2. ReportId proporcionado
3. Reporte existe
4. Usuario es propietario

**Response (Éxito):**

```json
{
  "success": true
}
```

**Response (Error):**

```json
{
  "error": "Mensaje de error descriptivo"
}
```

**Códigos de Estado:**

- `200` - Éxito
- `400` - Datos inválidos
- `401` - No autenticado
- `403` - No autorizado
- `404` - Reporte no encontrado
- `500` - Error del servidor

#### 3. `app/dashboard/analytics/page.tsx`

**Modificaciones:**

**Agregado:**

- Import de `ConsolidatedReportsList`
- Fetch de reportes consolidados
- Renderizado del componente

**Query Supabase:**

```typescript
const { data: consolidatedReports, error: reportsError } = await supabase
  .from("consolidated_reports")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });
```

**Orden de renderizado:**

1. Header de la página
2. Lista de reportes consolidados (arriba)
3. Tabla de proyectos (abajo)

---

## 🔄 Flujo de Usuario

### Escenario 1: Ver un reporte existente

```
1. Usuario va a /dashboard/analytics
2. Ve la lista de reportes consolidados
3. Hace clic en "Ver" en un reporte
4. Se abre el reporte en nueva pestaña
5. Puede navegar por las secciones del reporte
```

### Escenario 2: Compartir un reporte

```
1. Usuario va a /dashboard/analytics
2. Hace clic en el botón de copiar (📋)
3. Se copia la URL al portapapeles
4. Recibe notificación de éxito
5. Puede pegar el enlace donde necesite
```

### Escenario 3: Eliminar un reporte

```
1. Usuario va a /dashboard/analytics
2. Hace clic en el botón de eliminar (🗑️)
3. Se muestra diálogo de confirmación
4. Usuario confirma la eliminación
5. Se elimina el reporte
6. La lista se actualiza automáticamente
7. Se muestra notificación de éxito
```

### Escenario 4: Generar nuevo reporte

```
1. Usuario va a /dashboard/analytics
2. Selecciona proyectos de la tabla
3. Hace clic en "Generar Reporte Consolidado"
4. Se crea el reporte
5. Se redirige al reporte
6. El nuevo reporte aparece en la lista
```

---

## 🗄️ Base de Datos

### Tabla: `consolidated_reports`

**Columnas utilizadas:**

```sql
- id              UUID PRIMARY KEY
- user_id         UUID (referencia a auth.users)
- title           TEXT
- description     TEXT (nullable)
- slug            TEXT UNIQUE
- project_ids     UUID[] (array de UUIDs)
- is_public       BOOLEAN
- created_at      TIMESTAMP
- updated_at      TIMESTAMP
```

### RLS Policies

**Lectura:**

- Usuario puede ver sus propios reportes
- Cualquiera puede ver reportes públicos

**Escritura:**

- Usuario solo puede crear sus propios reportes

**Actualización:**

- Usuario solo puede actualizar sus propios reportes

**Eliminación:**

- Usuario solo puede eliminar sus propios reportes

---

## 🎨 Estilos y UX

### Estados Visuales

**Normal:**

- Fondo blanco/muted
- Bordes suaves

**Hover:**

- Fondo `muted/50`
- Transición suave

**Eliminando:**

- Botón deshabilitado
- Loading state (opcional)

### Iconos Utilizados

- `FileText` - Reporte
- `ExternalLink` - Ver reporte
- `Copy` - Copiar enlace
- `Trash2` - Eliminar reporte
- `Calendar` - Fecha
- `FolderOpen` - Número de proyectos

### Colores

- **Primary:** Iconos principales
- **Muted:** Texto secundario
- **Destructive:** Icono de eliminar

---

## 🧪 Testing

### Tests Recomendados

1. **Listar reportes**

   - Usuario con reportes ve la lista correctamente
   - Usuario sin reportes ve mensaje de estado vacío

2. **Ver reporte**

   - Link abre reporte en nueva pestaña
   - URL es correcta

3. **Copiar enlace**

   - URL se copia al portapapeles
   - Notificación aparece

4. **Eliminar reporte**
   - Diálogo de confirmación aparece
   - Cancelar no elimina
   - Confirmar elimina el reporte
   - Lista se actualiza
   - Usuario no propietario recibe error 403

---

## 🔐 Seguridad

### Validaciones Implementadas

1. **Autenticación**

   - Todas las acciones requieren usuario autenticado

2. **Autorización**

   - Usuario solo puede eliminar sus propios reportes
   - Verificación de `user_id` en el servidor

3. **Validación de Datos**
   - `reportId` es requerido
   - `reportId` debe ser UUID válido
   - Reporte debe existir

### Prevención de Ataques

- **CSRF:** Protegido por Next.js
- **SQL Injection:** Supabase previene automáticamente
- **XSS:** React escapa contenido automáticamente

---

## 📱 Responsive Design

### Mobile (< 768px)

- Botones se apilan verticalmente
- Texto truncado para títulos largos
- Iconos más grandes para touch

### Tablet (768px - 1024px)

- Botones en fila
- Espaciado optimizado

### Desktop (> 1024px)

- Layout completo
- Hover effects
- Tooltips (opcional)

---

## 🚀 Mejoras Futuras

### Posibles Extensiones

1. **Filtros y Búsqueda**

   - Buscar por título
   - Filtrar por fecha
   - Filtrar por número de proyectos

2. **Edición de Reportes**

   - Editar título y descripción
   - Cambiar visibilidad (público/privado)
   - Agregar/quitar proyectos

3. **Estadísticas**

   - Número de vistas del reporte
   - Fecha de última visualización
   - Analytics de compartidos

4. **Organización**

   - Carpetas para reportes
   - Tags/etiquetas
   - Favoritos

5. **Exportación en Lote**
   - Exportar múltiples reportes a la vez
   - Zip con todos los reportes

---

## 🐛 Troubleshooting

### Problema: "No aparecen mis reportes"

**Posibles causas:**

- RLS policies incorrectas
- `user_id` no coincide
- Error en la query

**Solución:**

1. Verificar logs del servidor
2. Revisar la tabla `consolidated_reports`
3. Confirmar que `user_id` es correcto

### Problema: "No puedo eliminar un reporte"

**Posibles causas:**

- No eres el propietario
- Problema de conexión
- Error en la API

**Solución:**

1. Verificar en consola del navegador
2. Confirmar que eres el propietario
3. Revisar logs del servidor

### Problema: "El enlace copiado no funciona"

**Posibles causas:**

- Reporte eliminado
- Reporte marcado como privado
- Slug incorrecto

**Solución:**

1. Verificar que el reporte existe
2. Confirmar que `is_public = true`
3. Probar el enlace en navegador privado

---

## 📚 Referencias

- **Componente principal:** `components/consolidated-reports-list.tsx`
- **API de eliminación:** `app/api/reports/delete/route.ts`
- **Página de analítica:** `app/dashboard/analytics/page.tsx`
- **Migración de DB:** `scripts/010_create_consolidated_reports.sql`

---

**Última actualización:** Octubre 2025  
**Versión:** 1.0.0
