# Mobile Pages Structure

Este directorio contiene versiones optimizadas para móvil de las páginas principales.

## Cómo funciona

El sistema utiliza `createAdaptivePage` para cargar automáticamente la versión móvil o desktop según el dispositivo detectado.

## Crear una nueva página móvil

1. **Crear el archivo móvil** en `pages/mobile/` con el mismo nombre que la página desktop:
   ```typescript
   // pages/mobile/Dashboard.tsx
   export default function MobileDashboard() {
     // Versión optimizada para móvil
   }
   ```

2. **Actualizar App.tsx** para usar routing adaptativo:
   ```typescript
   import { createAdaptivePage } from "@/utils/page-router";
   
   const Dashboard = createAdaptivePage(
     () => import("@/pages/Dashboard"),      // Versión desktop
     () => import("@/pages/mobile/Dashboard") // Versión móvil (opcional)
   );
   ```

3. Si no hay versión móvil, el sistema automáticamente usa la versión desktop como fallback.

## Ventajas del sistema

- ✅ **Carga condicional**: Solo carga el código necesario según el dispositivo
- ✅ **Mejor rendimiento**: Bundle más pequeño en móvil
- ✅ **Migración progresiva**: Puedes migrar páginas una por una
- ✅ **Fallback automático**: Si no hay versión móvil, usa desktop
- ✅ **Detección automática**: Usa `useIsMobile()` para detectar dispositivo

## Mejores prácticas

1. **Simplifica componentes** en versiones móviles
2. **Elimina funcionalidades pesadas** que no se usan en móvil
3. **Optimiza imágenes y assets** para móvil
4. **Usa componentes móviles nativos** (`MobilePullToRefresh`, etc.)
5. **Mantén la misma funcionalidad core** pero con UX optimizada

## Ejemplo: Dashboard

- **Desktop**: Versión completa con múltiples columnas, más información visible
- **Mobile**: Versión simplificada con una columna, menos información, mejor UX táctil
