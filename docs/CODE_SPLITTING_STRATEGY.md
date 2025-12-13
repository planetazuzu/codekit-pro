# 📦 Estrategia de Code-Splitting

## 🎯 Objetivo

Optimizar el rendimiento móvil mediante code-splitting inteligente, manteniendo la compatibilidad y evitando errores de inicialización.

## ⚠️ Problemas Encontrados

### Error 1: `forwardRef` undefined
```
Cannot read properties of undefined (reading 'forwardRef')
```
**Causa**: Radix UI necesita `React.forwardRef` al inicializarse, pero React estaba en otro chunk.

### Error 2: `Activity` undefined
```
Cannot set properties of undefined (setting 'Activity')
```
**Causa**: lucide-react registra iconos al inicializarse y necesita el contexto de React disponible.

## ✅ Solución Implementada

### Regla Crítica

**Dependencias que requieren React en la inicialización DEBEN estar en el mismo chunk.**

### Dependencias que DEBEN estar juntas (vendor principal)

Estas dependencias necesitan React disponible cuando se inicializan:

1. **React Core**
   - `react`
   - `react-dom`

2. **UI Libraries que usan React.forwardRef**
   - Todos los paquetes `@radix-ui/react-*`
   - Necesitan `React.forwardRef` al inicializarse

3. **Iconos**
   - `lucide-react`
   - Registra iconos al inicializarse, necesita React

4. **Libraries que pueden necesitar React al inicializarse**
   - `react-hook-form`
   - `react-markdown`
   - `react-syntax-highlighter`
   - `react-window`
   - `react-resizable-panels`
   - `react-day-picker`
   - `embla-carousel-react`
   - `recharts`
   - `next-themes`
   - `sonner`
   - `vaul`

### Dependencias que PUEDEN estar separadas

Estas dependencias usan React pero no lo necesitan al inicializarse:

1. **React Ecosystem**
   - `react-helmet-async`
   - `react-router` (si se usara)

2. **Query Library**
   - `@tanstack/react-query`
   - Usa React pero no lo necesita al inicializarse

3. **Router**
   - `wouter`
   - Independiente de React

4. **Animation**
   - `framer-motion`
   - Usa React pero no lo necesita al inicializarse

## 📋 Configuración Actual

```typescript
manualChunks(id) {
  if (id.includes('node_modules')) {
    // Safe to separate
    if (id.includes('react-helmet') || id.includes('react-router')) {
      return 'react-ecosystem';
    }
    if (id.includes('@tanstack/react-query')) {
      return 'query-vendor';
    }
    if (id.includes('wouter')) {
      return 'router-vendor';
    }
    if (id.includes('framer-motion')) {
      return 'animation-vendor';
    }
    
    // Everything else (including React, Radix UI, lucide-react) → vendor
    return 'vendor';
  }
  
  // Separate tools and common components
  if (id.includes('/tools/')) {
    return 'tools';
  }
  if (id.includes('/components/common/')) {
    return 'common-components';
  }
}
```

## 🔍 Cómo Verificar si una Dependencia Puede Estar Separada

### ✅ Puede estar separada si:
- No usa `React.forwardRef` al inicializarse
- No registra componentes/iconos al inicializarse
- No necesita el contexto de React al cargar
- Solo usa React dentro de funciones/componentes

### ❌ DEBE estar en vendor si:
- Usa `React.forwardRef` al inicializarse
- Registra componentes/iconos al inicializarse
- Necesita el contexto de React al cargar
- Tiene efectos secundarios que requieren React

## 🚨 Reglas para Futuras Modificaciones

1. **NUNCA separar React, Radix UI o lucide-react**
   - Siempre van al vendor principal

2. **Antes de separar una nueva dependencia de React:**
   - Verificar si usa `React.forwardRef` al inicializarse
   - Verificar si registra componentes/iconos al inicializarse
   - Probar en producción antes de desplegar

3. **Si aparece un error de "undefined" relacionado con React:**
   - Mover la dependencia problemática al vendor principal
   - Verificar el orden de carga de chunks
   - Limpiar Service Worker y cache

4. **Documentar cambios:**
   - Actualizar este documento
   - Explicar por qué se separa o no se separa

## 📊 Resultado Actual

- **Vendor principal**: ~2.1MB (664KB gzip)
  - Incluye: React, Radix UI, lucide-react, y todas las dependencias críticas
  
- **Chunks separados**:
  - `react-ecosystem`: react-helmet-async
  - `query-vendor`: @tanstack/react-query
  - `router-vendor`: wouter
  - `animation-vendor`: framer-motion
  - `tools`: Herramientas pesadas (lazy loaded)
  - `common-components`: Componentes comunes

## 🔧 Troubleshooting

### Si aparece error de "forwardRef" o "Activity":
1. Verificar que React, Radix UI y lucide-react están en vendor
2. Limpiar Service Worker
3. Hard refresh (Ctrl+Shift+R)
4. Verificar orden de carga en Network tab

### Si el vendor es muy grande:
- Considerar lazy loading de herramientas pesadas
- Separar solo dependencias que sean seguras
- NO separar React, Radix UI o lucide-react

## 📝 Notas Técnicas

- Vite/Rollup maneja las dependencias automáticamente
- El orden de carga está determinado por las dependencias
- Si React se carga después de una dependencia que lo necesita, habrá error
- La solución actual garantiza que React se carga primero

---

**Última actualización**: 2025-12-13  
**Estado**: ✅ Estable - Sin errores de chunks

