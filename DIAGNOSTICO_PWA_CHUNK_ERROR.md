# 🔍 Diagnóstico: Error "No se pudo cargar este componente" en PWA Android

## 🎯 Problema Identificado

**Error**: "No se pudo cargar este componente" después de un redeploy en PWA instalada en Android.

**Causa Raíz**: ChunkLoadError debido a Service Worker cacheando chunks JS/CSS antiguos que ya no existen después del redeploy.

---

## 🔴 Problemas Críticos Encontrados

### 1. **Service Worker con Cache First para JS/CSS** ⚠️ CRÍTICO
**Ubicación**: `client/public/sw.js` líneas 98-118

**Problema**:
- El SW usa estrategia **Cache First** para archivos `.js` y `.css`
- Cuando se hace un redeploy, Vite genera nuevos chunks con nuevos hashes:
  - `index-abc123.js` (build antiguo)
  - `index-xyz789.js` (build nuevo)
- El SW intenta servir `index-abc123.js` desde caché, pero el archivo ya no existe en el servidor
- Resultado: **ChunkLoadError** → ErrorBoundary captura → "No se pudo cargar este componente"

**Impacto**: ALTO - Rompe la app después de cada redeploy en usuarios con PWA instalada.

---

### 2. **ErrorBoundary No Distingue ChunkLoadError** ⚠️ ALTO
**Ubicación**: `client/src/components/common/ErrorBoundary.tsx`

**Problema**:
- El ErrorBoundary muestra mensaje genérico "No se pudo cargar este componente"
- No detecta específicamente ChunkLoadError
- No ofrece opción de recargar la página (que solucionaría el problema)
- El usuario queda bloqueado sin saber qué hacer

---

### 3. **Service Worker Sin Versionado Dinámico** ⚠️ MEDIO
**Ubicación**: `client/public/sw.js` línea 2

**Problema**:
- `CACHE_NAME = 'codekit-pro-v3-mobile'` está hardcodeado
- No cambia automáticamente con cada build
- Si se actualiza manualmente, todos los usuarios quedan sin caché de golpe
- No hay sincronización entre versión del SW y versión del build

---

### 4. **No Hay Retry Logic para Chunks Fallidos** ⚠️ MEDIO
**Ubicación**: `client/src/App.tsx` y `client/src/utils/page-router.tsx`

**Problema**:
- Si un chunk falla al cargar, no hay retry automático
- No hay detección de "chunk no encontrado" vs otros errores
- No hay fallback a recarga completa de la página

---

### 5. **Registro de SW No Fuerza Actualización** ⚠️ BAJO
**Ubicación**: `client/src/main.tsx` líneas 21-31

**Problema**:
- Detecta cuando hay un nuevo SW disponible
- Pero solo loguea en consola, no fuerza actualización
- No limpia caché cuando se detecta nueva versión

---

## ✅ Soluciones Propuestas (Priorizadas)

### 🔴 PRIORIDAD 1: Cambiar Estrategia del SW para JS/CSS

**Cambio**: De Cache First → **Stale-While-Revalidate** o **Network First con fallback corto**

**Razón**: Los chunks JS/CSS deben actualizarse después de cada deploy. Cache First es demasiado agresivo.

**Archivo**: `client/public/sw.js`

---

### 🔴 PRIORIDAD 2: Detectar ChunkLoadError en ErrorBoundary

**Cambio**: Detectar específicamente ChunkLoadError y ofrecer botón "Recargar Página"

**Razón**: El usuario necesita saber qué hacer cuando hay un ChunkLoadError.

**Archivo**: `client/src/components/common/ErrorBoundary.tsx`

---

### 🟡 PRIORIDAD 3: Versionado Dinámico del SW

**Cambio**: Generar versión del SW basada en hash del build o timestamp

**Razón**: Asegura que el SW se actualice con cada deploy.

**Archivos**: `client/public/sw.js`, `script/build.ts`

---

### 🟡 PRIORIDAD 4: Retry Logic para Chunks

**Cambio**: Detectar errores de carga de chunks y retry con recarga de página

**Razón**: Recuperación automática de errores temporales.

**Archivo**: `client/src/utils/chunk-error-handler.ts` (nuevo)

---

### 🟢 PRIORIDAD 5: Forzar Actualización del SW

**Cambio**: Cuando se detecta nuevo SW, limpiar caché y recargar

**Razón**: Mejora la experiencia cuando hay actualizaciones.

**Archivo**: `client/src/main.tsx`

---

## 📋 Plan de Implementación

1. ✅ Cambiar estrategia SW (Prioridad 1)
2. ✅ Mejorar ErrorBoundary (Prioridad 2)
3. ✅ Añadir retry logic (Prioridad 4 - más rápido de implementar)
4. ✅ Versionado SW (Prioridad 3)
5. ✅ Mejorar registro SW (Prioridad 5)

---

## 🔧 Cambios de Código Necesarios

Ver archivos modificados en siguiente paso.
