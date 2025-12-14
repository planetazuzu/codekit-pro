# 📱 Plan de Migración a Páginas Móvil/Desktop

Lista completa de páginas a migrar al sistema de routing adaptativo móvil/desktop.

## ✅ Páginas Ya Migradas

- [x] **Dashboard** (`/`) - ✅ Completado
  - Archivo: `pages/mobile/Dashboard.tsx`
  - Estado: Optimizado para móvil con versión simplificada

- [x] **Prompts** (`/prompts`) - ✅ Completado
  - Archivo: `pages/mobile/Prompts.tsx`
  - Estado: Versión móvil optimizada con filtros en bottom sheet

- [x] **Snippets** (`/snippets`) - ✅ Completado
  - Archivo: `pages/mobile/Snippets.tsx`
  - Estado: Versión móvil sin syntax highlighting pesado, preview ligero

- [x] **Tools** (`/tools`) - ✅ Completado
  - Archivo: `pages/mobile/Tools.tsx`
  - Estado: Lista de una columna optimizada para móvil

- [x] **Guides** (`/guides`) - ✅ Completado
  - Archivo: `pages/mobile/Guides.tsx`
  - Estado: Versión móvil sin gestos complejos

---

## 🔴 PRIORIDAD ALTA - Páginas Críticas (Problemas en Móvil)

### 1. **Prompts** (`/prompts`) - 🔴 CRÍTICO
- **Ruta:** `pages/Prompts.tsx`
- **Razón:** Página principal muy usada, probable causa de problemas de carga en móvil
- **Complejidad:** Alta (búsqueda, filtros, lista de prompts)
- **Componentes móviles ya usados:** `MobilePullToRefresh`, `MobileFloatingButton`, `MobileBottomSheet`
- **Archivo móvil:** `pages/mobile/Prompts.tsx`
- **Tareas:**
  - [ ] Crear versión móvil simplificada
  - [ ] Optimizar lista de prompts (virtualización móvil)
  - [ ] Simplificar filtros (usar bottom sheet)
  - [ ] Actualizar App.tsx routing

### 2. **Snippets** (`/snippets`) - 🔴 CRÍTICO
- **Ruta:** `pages/Snippets.tsx`
- **Razón:** Usa VirtualizedList que puede causar problemas en móvil
- **Complejidad:** Alta (código con syntax highlighting, búsqueda, swipe actions)
- **Componentes móviles ya usados:** `MobilePullToRefresh`, `MobileFloatingButton`, `MobileSwipeActions`
- **Archivo móvil:** `pages/mobile/Snippets.tsx`
- **Tareas:**
  - [ ] Crear versión móvil simplificada
  - [ ] Optimizar VirtualizedList para móvil o usar alternativa más ligera
  - [ ] Simplificar syntax highlighting en móvil
  - [ ] Optimizar swipe actions
  - [ ] Actualizar App.tsx routing

### 3. **Tools** (`/tools`) - 🔴 ALTA
- **Ruta:** `pages/Tools.tsx`
- **Razón:** Página de listado principal, puede ser pesada
- **Complejidad:** Media-Alta (grid de herramientas, filtros)
- **Componentes móviles ya usados:** `MobileBottomSheet`
- **Archivo móvil:** `pages/mobile/Tools.tsx`
- **Tareas:**
  - [ ] Crear versión móvil con grid simplificado
  - [ ] Optimizar cards de herramientas para móvil
  - [ ] Mover filtros a bottom sheet
  - [ ] Actualizar App.tsx routing

### 4. **Guides** (`/guides`) - 🟡 ALTA
- **Ruta:** `pages/Guides.tsx`
- **Razón:** Usa muchos componentes móviles pero puede optimizarse
- **Complejidad:** Alta (filtros, gestos, búsqueda)
- **Componentes móviles ya usados:** `MobilePullToRefresh`, `MobileFloatingButton`, `MobileBottomSheet`, `MobileGestureHandler`
- **Archivo móvil:** `pages/mobile/Guides.tsx`
- **Tareas:**
  - [ ] Crear versión móvil optimizada
  - [ ] Simplificar gestos (mover a versión desktop)
  - [ ] Optimizar filtros
  - [ ] Actualizar App.tsx routing

---

## 🟡 PRIORIDAD MEDIA - Páginas Importantes

### 5. **Links** (`/links`) - 🟡 MEDIA
- **Ruta:** `pages/Links.tsx`
- **Complejidad:** Media (lista de enlaces, swipe actions)
- **Componentes móviles ya usados:** `MobilePullToRefresh`, `MobileFloatingButton`, `MobileSwipeActions`
- **Archivo móvil:** `pages/mobile/Links.tsx`
- **Tareas:**
  - [ ] Crear versión móvil simplificada
  - [ ] Optimizar lista de enlaces
  - [ ] Actualizar App.tsx routing

### 6. **Resources** (`/resources`) - 🟡 MEDIA
- **Ruta:** `pages/Resources.tsx`
- **Complejidad:** Media-Alta (múltiples categorías, swipe actions)
- **Componentes móviles ya usados:** `MobilePullToRefresh`, `MobileSwipeActions`, `MobileShareSheet`
- **Archivo móvil:** `pages/mobile/Resources.tsx`
- **Tareas:**
  - [ ] Crear versión móvil
  - [ ] Simplificar categorías
  - [ ] Actualizar App.tsx routing

### 7. **APIGuides** (`/api-guides`) - 🟡 MEDIA
- **Ruta:** `pages/APIGuides.tsx`
- **Complejidad:** Media (documentación API)
- **Componentes móviles ya usados:** `MobilePullToRefresh`
- **Archivo móvil:** `pages/mobile/APIGuides.tsx`
- **Tareas:**
  - [ ] Crear versión móvil optimizada para lectura
  - [ ] Mejorar legibilidad en móvil
  - [ ] Actualizar App.tsx routing

### 8. **Docs** (`/docs`) - 🟡 MEDIA
- **Ruta:** `pages/Docs.tsx`
- **Complejidad:** Media (visor de markdown)
- **Componentes móviles ya usados:** `MobilePullToRefresh`
- **Archivo móvil:** `pages/mobile/Docs.tsx`
- **Tareas:**
  - [ ] Crear versión móvil optimizada
  - [ ] Mejorar renderizado de markdown en móvil
  - [ ] Actualizar App.tsx routing

---

## 🟢 PRIORIDAD BAJA - Páginas Simples

### 9. **Deals** (`/deals`) - 🟢 BAJA
- **Ruta:** `pages/Deals.tsx`
- **Complejidad:** Baja (lista de ofertas)
- **Componentes móviles ya usados:** `MobilePullToRefresh`, `MobileShareSheet`
- **Archivo móvil:** `pages/mobile/Deals.tsx`
- **Tareas:**
  - [ ] Crear versión móvil simplificada
  - [ ] Actualizar App.tsx routing

### 10. **Legal** (`/legal`) - 🟢 BAJA
- **Ruta:** `pages/Legal.tsx`
- **Complejidad:** Baja (texto legal)
- **Componentes móviles ya usados:** `MobilePullToRefresh`
- **Archivo móvil:** `pages/mobile/Legal.tsx`
- **Tareas:**
  - [ ] Crear versión móvil optimizada para lectura
  - [ ] Actualizar App.tsx routing

### 11. **Privacy** (`/privacy`) - 🟢 BAJA
- **Ruta:** `pages/Privacy.tsx`
- **Complejidad:** Baja (texto de privacidad)
- **Componentes móviles ya usados:** `MobilePullToRefresh`
- **Archivo móvil:** `pages/mobile/Privacy.tsx`
- **Tareas:**
  - [ ] Crear versión móvil optimizada para lectura
  - [ ] Actualizar App.tsx routing

### 12. **AffiliateLanding** (`/tools/:slug`) - 🟢 BAJA
- **Ruta:** `pages/AffiliateLanding.tsx`
- **Complejidad:** Baja (página de aterrizaje)
- **Componentes móviles ya usados:** `MobilePullToRefresh`, `MobileShareSheet`
- **Archivo móvil:** `pages/mobile/AffiliateLanding.tsx`
- **Tareas:**
  - [ ] Crear versión móvil optimizada
  - [ ] Actualizar App.tsx routing

---

## ⚙️ Páginas de Admin (Opcional - Menos Prioridad)

### 13. **Admin** (`/admin`) - 🔵 ADMIN
- **Ruta:** `pages/Admin.tsx`
- **Complejidad:** Alta (dashboard admin, estadísticas)
- **Componentes móviles ya usados:** `MobileOnly`, `DesktopOnly` (parcialmente optimizado)
- **Archivo móvil:** `pages/mobile/Admin.tsx`
- **Tareas:**
  - [ ] Crear versión móvil simplificada
  - [ ] Optimizar gráficos/estadísticas para móvil
  - [ ] Actualizar App.tsx routing
- **Nota:** Admin generalmente se usa en desktop, pero buena práctica tener versión móvil

### 14. **AdminAffiliates** (`/admin/affiliates`) - 🔵 ADMIN
- **Ruta:** `pages/AdminAffiliates.tsx`
- **Complejidad:** Alta
- **Archivo móvil:** `pages/mobile/AdminAffiliates.tsx`
- **Tareas:**
  - [ ] Crear versión móvil
  - [ ] Actualizar App.tsx routing

### 15. **AffiliateProgramsTracker** (`/admin/affiliates-tracker`) - 🔵 ADMIN
- **Ruta:** `pages/AffiliateProgramsTracker.tsx`
- **Complejidad:** Alta
- **Archivo móvil:** `pages/mobile/AffiliateProgramsTracker.tsx`
- **Tareas:**
  - [ ] Crear versión móvil
  - [ ] Actualizar App.tsx routing

### 16. **AffiliateProgramsDashboard** (`/admin/affiliates-dashboard`) - 🔵 ADMIN
- **Ruta:** `pages/AffiliateProgramsDashboard.tsx`
- **Complejidad:** Alta
- **Archivo móvil:** `pages/mobile/AffiliateProgramsDashboard.tsx`
- **Tareas:**
  - [ ] Crear versión móvil
  - [ ] Actualizar App.tsx routing

---

## 🛠️ Páginas de Tools Individuales (Opcional - Baja Prioridad)

Las herramientas individuales (`/tools/*`) generalmente son simples y funcionan bien en móvil.
Si alguna tiene problemas específicos, se puede migrar individualmente:

- `ReadmeGenerator` (`/tools/readme`)
- `MetaGenerator` (`/tools/meta`)
- `FolderGenerator` (`/tools/folders`)
- `JSONSchemaGenerator` (`/tools/json`)
- `Base64Converter` (`/tools/base64`)
- `ColorGenerator` (`/tools/colors`)
- `SVGGenerator` (`/tools/svg`)
- `FaviconGenerator` (`/tools/favicon`)
- `MockupGenerator` (`/tools/mockup`)
- `LicenseGenerator` (`/tools/license`)
- `GitIgnoreGenerator` (`/tools/gitignore`)
- `JSONFormatter` (`/tools/json-formatter`)
- `YAMLFormatter` (`/tools/yaml-formatter`)
- `RegexTester` (`/tools/regex`)
- `UUIDGenerator` (`/tools/uuid`)
- `JWTDecoder` (`/tools/jwt`)
- `JSONToTypeScript` (`/tools/json-to-ts`)
- `APITester` (`/tools/api-tester`)
- `DatabaseModelGenerator` (`/tools/db-models`)
- `SmartPromptGenerator` (`/tools/smart-prompts`)
- `CodeRewriter` (`/tools/code-rewriter`)
- `FunctionGenerator` (`/tools/function-generator`)
- `ErrorExplainer` (`/tools/error-explainer`)
- `TestGenerator` (`/tools/test-generator`)
- `AutoDocumentation` (`/tools/auto-docs`)
- `UsageExamplesGenerator` (`/tools/usage-examples`)

**Nota:** Estas herramientas se pueden migrar solo si presentan problemas específicos en móvil.

---

## 📊 Resumen de Migración

### Total de Páginas Principales: 16
- ✅ **Completadas:** 17/17 páginas (100%)
  - 🔴 **Prioridad Alta:** 5/5 ✅ (Dashboard, Prompts, Snippets, Tools, Guides)
  - 🟡 **Prioridad Media:** 4/4 ✅ (Links, Resources, APIGuides, Docs)
  - 🟢 **Prioridad Baja:** 4/4 ✅ (Deals, Legal, Privacy, AffiliateLanding)
  - 🔵 **Admin:** 4/4 ✅ (Admin, AdminAffiliates, AffiliateProgramsTracker, AffiliateProgramsDashboard)
- 🛠️ **Tools Individuales (Opcional):** 0/25+ (solo si hay problemas específicos)

### Plan de Ejecución Sugerido

1. **Fase 1 (Crítico):** Migrar Prompts, Snippets, Tools, Guides
2. **Fase 2 (Importante):** Migrar Links, Resources, APIGuides, Docs
3. **Fase 3 (Completar):** Migrar Deals, Legal, Privacy, AffiliateLanding
4. **Fase 4 (Opcional):** Migrar páginas Admin si es necesario
5. **Fase 5 (Opcional):** Migrar tools individuales solo si hay problemas

---

## 📝 Template para Crear Página Móvil

```typescript
// pages/mobile/MiPagina.tsx
import { Layout } from "@/layout/Layout";
import { MobilePullToRefresh } from "@/components/mobile";
import { useTrackPageView } from "@/hooks/use-track-view";

export default function MobileMiPagina() {
  useTrackPageView("page", "mi-pagina-mobile");
  
  return (
    <Layout>
      <MobilePullToRefresh onRefresh={async () => {}}>
        <div className="space-y-4 pb-20">
          {/* Contenido optimizado para móvil */}
        </div>
      </MobilePullToRefresh>
    </Layout>
  );
}
```

---

## 🔧 Actualizar App.tsx

Para cada página migrada, cambiar en `App.tsx`:

```typescript
// ANTES:
const MiPagina = lazy(() => import("@/pages/MiPagina"));

// DESPUÉS:
const MiPagina = createAdaptivePage(
  () => import("@/pages/MiPagina"),
  () => import("@/pages/mobile/MiPagina")
);
```

---

## ✅ Checklist de Migración

Para cada página:
- [ ] Crear archivo en `pages/mobile/`
- [ ] Optimizar componente para móvil
- [ ] Simplificar layout (single column)
- [ ] Usar componentes móviles nativos
- [ ] Actualizar App.tsx con `createAdaptivePage`
- [ ] Probar en dispositivo móvil real
- [ ] Verificar rendimiento (lighthouse mobile)
- [ ] Actualizar este documento marcando como completado
