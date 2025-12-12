# 📱 Guía Mobile-First - Componentes Específicos para Móvil

## 🎯 Objetivo

Esta guía explica cómo usar los componentes específicos para móvil que SOLO se muestran en dispositivos móviles.

## 📦 Componentes Disponibles

### 1. `MobileOnly`
Renderiza contenido SOLO en dispositivos móviles.

```tsx
import { MobileOnly } from "@/components/mobile";

function MyComponent() {
  return (
    <>
      <MobileOnly>
        <div>Este contenido solo se ve en móvil</div>
      </MobileOnly>
    </>
  );
}
```

### 2. `DesktopOnly`
Renderiza contenido SOLO en desktop.

```tsx
import { DesktopOnly } from "@/components/mobile";

function MyComponent() {
  return (
    <>
      <DesktopOnly>
        <div>Este contenido solo se ve en desktop</div>
      </DesktopOnly>
    </>
  );
}
```

### 3. `MobileActions`
Barra de acciones flotante para móvil.

```tsx
import { MobileActions } from "@/components/mobile";
import { Button } from "@/components/ui/button";

function MyComponent() {
  return (
    <MobileActions position="bottom">
      <div className="flex gap-2 p-4">
        <Button className="flex-1">Acción 1</Button>
        <Button className="flex-1">Acción 2</Button>
      </div>
    </MobileActions>
  );
}
```

### 4. `MobilePullToRefresh`
Implementa pull-to-refresh para móvil.

```tsx
import { MobilePullToRefresh } from "@/components/mobile";

function MyComponent() {
  const handleRefresh = async () => {
    // Tu lógica de refresh
    await fetchData();
  };

  return (
    <MobilePullToRefresh onRefresh={handleRefresh}>
      <div>Tu contenido aquí</div>
    </MobilePullToRefresh>
  );
}
```

## 🪝 Hooks Disponibles

### `useIsMobile()`
Detecta si el dispositivo es móvil.

```tsx
import { useIsMobile } from "@/hooks/use-mobile";

function MyComponent() {
  const isMobile = useIsMobile();
  
  return (
    <div>
      {isMobile ? "Estás en móvil" : "Estás en desktop"}
    </div>
  );
}
```

### `useIsTablet()`
Detecta si el dispositivo es tablet.

```tsx
import { useIsTablet } from "@/hooks/use-mobile";

function MyComponent() {
  const isTablet = useIsTablet();
  
  return (
    <div>
      {isTablet ? "Estás en tablet" : "No estás en tablet"}
    </div>
  );
}
```

### `useScreenSize()`
Obtiene información completa del tamaño de pantalla.

```tsx
import { useScreenSize } from "@/hooks/use-mobile";

function MyComponent() {
  const { width, height, isMobile, isTablet, isDesktop } = useScreenSize();
  
  return (
    <div>
      <p>Ancho: {width}px</p>
      <p>Alto: {height}px</p>
      <p>Es móvil: {isMobile ? "Sí" : "No"}</p>
      <p>Es tablet: {isTablet ? "Sí" : "No"}</p>
      <p>Es desktop: {isDesktop ? "Sí" : "No"}</p>
    </div>
  );
}
```

### `useOrientation()`
Detecta la orientación del dispositivo.

```tsx
import { useOrientation } from "@/hooks/use-mobile";

function MyComponent() {
  const orientation = useOrientation();
  
  return (
    <div>
      {orientation === "portrait" ? "Vertical" : "Horizontal"}
    </div>
  );
}
```

## 📝 Ejemplos de Uso

### Ejemplo 1: Botón flotante solo en móvil

```tsx
import { MobileOnly } from "@/components/mobile";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function FloatingButton() {
  return (
    <MobileOnly>
      <Button
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-40"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </MobileOnly>
  );
}
```

### Ejemplo 2: Navegación diferente para móvil y desktop

```tsx
import { MobileOnly, DesktopOnly } from "@/components/mobile";

function Navigation() {
  return (
    <>
      <MobileOnly>
        <MobileBottomNav />
      </MobileOnly>
      
      <DesktopOnly>
        <DesktopSidebar />
      </DesktopOnly>
    </>
  );
}
```

### Ejemplo 3: Pull to refresh en lista

```tsx
import { MobilePullToRefresh } from "@/components/mobile";
import { usePrompts } from "@/hooks/use-prompts";

function PromptsList() {
  const { data, refetch } = usePrompts();
  
  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <MobilePullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-4">
        {data?.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </MobilePullToRefresh>
  );
}
```

## 🎨 Breakpoints

- **Móvil**: `< 768px`
- **Tablet**: `768px - 1023px`
- **Desktop**: `≥ 1024px`

## 💡 Mejores Prácticas

1. **Usa `MobileOnly` para funcionalidades específicas de móvil**
   - Gestos táctiles
   - Navegación inferior
   - Botones flotantes

2. **Usa `DesktopOnly` para funcionalidades de desktop**
   - Sidebars complejos
   - Hover effects
   - Tooltips extensos

3. **Combina con Tailwind responsive classes**
   ```tsx
   <div className="md:hidden">Solo móvil (Tailwind)</div>
   <MobileOnly>Solo móvil (Componente)</MobileOnly>
   ```

4. **Optimiza el rendimiento**
   - Los componentes móviles solo se renderizan cuando es necesario
   - Usa `useIsMobile()` para lógica condicional

## 🔧 Personalización

Puedes ajustar los breakpoints en `client/src/hooks/use-mobile.tsx`:

```tsx
const MOBILE_BREAKPOINT = 768  // Cambiar según necesidad
const TABLET_BREAKPOINT = 1024 // Cambiar según necesidad
```

