# ✅ Solución: Error PWA "No se pudo cargar este componente"

## 🔍 Diagnóstico

**Problema**: Después de un redeploy, la PWA instalada en Android muestra "No se pudo cargar este componente".

**Causa Raíz**: 
1. Service Worker cacheaba chunks JS/CSS con estrategia **Cache First**
2. Tras un redeploy, Vite genera nuevos chunks con nuevos hashes
3. El SW intenta servir chunks antiguos desde caché que ya no existen → **ChunkLoadError**
4. ErrorBoundary captura el error pero no distingue ChunkLoadError de otros errores

---

## ✅ Soluciones Implementadas

### 1. **Service Worker: Network First para JS/CSS** ⚠️ CRÍTICO

**Archivo**: `client/public/sw.js`

**Cambio**:
- **ANTES**: Cache First para todos los assets estáticos
- **AHORA**: Network First para `.js`, `.css`, `.mjs` / Cache First para imágenes/fuentes

**Impacto**: Los chunks JS/CSS se obtienen del servidor primero, evitando servir versiones antiguas después de un redeploy.

```javascript
// Antes (línea 128): Cache First - causaba ChunkLoadError
if (isStaticAsset) {
  caches.match(request).then(cached => cached || fetch(request))
}

// Ahora: Network First para JS/CSS
if (isJSOrCSS) {
  fetch(request).then(response => {
    // Cachear para uso futuro, pero servir del servidor
    cache.put(request, response.clone());
    return response;
  }).catch(() => caches.match(request)) // Fallback offline
}
```

---

### 2. **ErrorBoundary Mejorado: Detección de ChunkLoadError** ⚠️ CRÍTICO

**Archivo**: `client/src/components/common/ErrorBoundary.tsx`

**Cambio**:
- Detecta específicamente ChunkLoadError usando `isChunkLoadError()`
- Muestra mensaje específico: "Actualización Disponible"
- Botón "Recargar Página" que limpia caché y recarga

**Impacto**: El usuario sabe exactamente qué hacer cuando hay un ChunkLoadError.

```typescript
// Detecta ChunkLoadError específicamente
const chunkError = isChunkLoadError(error);
if (chunkError.isChunkError) {
  // Muestra mensaje específico con botón de recarga
  return <ChunkErrorUI onReload={handleReload} />;
}
```

---

### 3. **Detector de Chunk Errors** 🆕

**Archivo**: `client/src/lib/chunk-error-handler.ts` (nuevo)

**Funcionalidad**:
- Detecta patrones de ChunkLoadError
- Retry logic automático
- Limpieza de caché y recarga de página

**Patrones detectados**:
- "Failed to fetch dynamically imported module"
- "Loading chunk X failed"
- "ChunkLoadError"
- Network errors al cargar `.js` files

---

### 4. **Retry Logic en Dynamic Imports** 🆕

**Archivo**: `client/src/utils/page-router.tsx`

**Cambio**:
- Los imports dinámicos ahora tienen manejo de errores
- Si detecta ChunkLoadError, hace retry automático
- Si falla después de retries, recarga la página

**Impacto**: Recuperación automática sin intervención del usuario.

---

### 5. **Versionado del Service Worker** 🔧

**Archivo**: `client/public/sw.js`

**Cambio**:
- Versión explícita: `SW_VERSION = 'v4'`
- Caches nombrados con versión: `codekit-pro-v4-mobile`
- Limpieza automática de caches antiguos en `activate`

**Cómo actualizar**: Incrementar `SW_VERSION` después de cambios importantes en el SW.

---

### 6. **Auto-actualización del Service Worker** 🔧

**Archivo**: `client/src/main.tsx`

**Cambio**:
- Cuando detecta nuevo SW disponible, limpia caches antiguos
- Activa nuevo SW inmediatamente
- Recarga página automáticamente después de 500ms

**Impacto**: Los usuarios obtienen la nueva versión automáticamente después de un deploy.

---

## 📋 Checklist de Verificación Post-Deploy

Después de desplegar, verificar:

- [ ] El SW se actualiza correctamente (check en DevTools → Application → Service Workers)
- [ ] Los chunks se cargan desde el servidor (Network tab → verificar que los .js tienen status 200, no "(from cache)")
- [ ] El ErrorBoundary muestra mensaje correcto si hay ChunkLoadError
- [ ] La PWA instalada se actualiza automáticamente
- [ ] No hay errores de chunks en consola

---

## 🧪 Cómo Probar

### 1. Simular ChunkLoadError (Desarrollo)
```javascript
// En consola del navegador
const originalImport = window.chunkImport;
window.chunkImport = () => Promise.reject(new Error('Failed to fetch dynamically imported module'));
// Luego navegar a una página que use lazy loading
```

### 2. Probar en PWA Instalada
1. Instalar PWA en Android
2. Hacer un redeploy
3. Abrir la PWA instalada
4. Verificar que se actualiza correctamente sin errores

### 3. Verificar Service Worker
```javascript
// En consola del navegador
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW version:', reg.active?.scriptURL);
  reg.update(); // Forzar actualización
});
```

---

## 🚀 Despliegue

```bash
cd /var/www/codekit-pro && \
git pull origin main && \
docker compose down && \
docker compose build --no-cache app && \
docker compose up -d && \
sleep 15 && \
docker compose ps && \
curl http://localhost:8604/api/health
```

**Importante**: Después del deploy, los usuarios con PWA instalada verán:
1. Detección automática de nuevo SW
2. Limpieza de caches antiguos
3. Recarga automática de la página
4. Carga de chunks nuevos desde el servidor

---

## 🔄 Si el Problema Persiste

### Para Usuarios Afectados (Solución Manual):

1. **Limpiar Caché de la PWA**:
   - Android: Configuración → Apps → CodeKit Pro → Almacenamiento → Limpiar caché
   - Luego desinstalar y reinstalar la PWA

2. **Forzar Actualización del SW**:
   ```javascript
   // En consola del navegador
   navigator.serviceWorker.getRegistrations().then(regs => {
     regs.forEach(reg => reg.unregister());
   });
   location.reload();
   ```

3. **Limpiar Todo el Caché**:
   ```javascript
   // En consola del navegador
   caches.keys().then(keys => {
     keys.forEach(key => caches.delete(key));
   });
   location.reload();
   ```

---

## 📊 Monitoreo

Para detectar ChunkLoadErrors en producción:

```javascript
// Añadir a ErrorBoundary.onError o global error handler
window.addEventListener('error', (event) => {
  if (isChunkLoadError(event.error)) {
    // Enviar a analytics/error tracking
    console.error('ChunkLoadError detected:', event.error);
  }
});
```

---

## ✅ Resultado Esperado

Después de implementar estas soluciones:

1. ✅ **No más ChunkLoadError** después de redeploys
2. ✅ **Actualización automática** de la PWA
3. ✅ **Experiencia mejorada** con mensajes claros si hay errores
4. ✅ **Recuperación automática** con retry logic

---

## 🔗 Archivos Modificados

- ✅ `client/public/sw.js` - Estrategia Network First para JS/CSS
- ✅ `client/src/components/common/ErrorBoundary.tsx` - Detección ChunkLoadError
- ✅ `client/src/lib/chunk-error-handler.ts` - Utilidades para detectar chunk errors
- ✅ `client/src/utils/page-router.tsx` - Retry logic en imports
- ✅ `client/src/main.tsx` - Auto-actualización del SW
- ✅ `DIAGNOSTICO_PWA_CHUNK_ERROR.md` - Documentación del problema

---

## 📝 Notas Importantes

1. **Incrementar SW_VERSION** cuando hagas cambios importantes en el SW
2. **Los chunks se cachean** después de la primera carga (para performance offline)
3. **Network First** asegura que siempre se obtenga la versión más reciente primero
4. **El ErrorBoundary** ahora distingue entre ChunkLoadError y otros errores

---

## 🎯 Próximos Pasos (Opcional)

1. Implementar versionado automático del SW basado en hash del build
2. Añadir analytics para rastrear ChunkLoadErrors
3. Implementar notificación push cuando hay nueva versión disponible
4. Añadir botón de "Actualizar App" en la UI cuando hay nueva versión
