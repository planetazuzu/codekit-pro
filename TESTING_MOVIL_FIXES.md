# Plan de Testing - Fixes removeChild (Versión Móvil)

## 🎯 Objetivo
Verificar que los fixes críticos eliminan los errores de `removeChild`, loops infinitos y React Error #31/#185 en dispositivos móviles.

---

## ✅ Checklist Pre-Despliegue

### 1. Verificar Service Worker Deshabilitado

**En consola del navegador móvil:**
```javascript
// Ejecutar inmediatamente al cargar la página
navigator.serviceWorker.getRegistrations()
  .then(regs => {
    console.log('SW registrations:', regs.length);
    if (regs.length > 0) {
      console.error('❌ ERROR: Hay Service Workers registrados!');
      regs.forEach(r => {
        console.log('SW scope:', r.scope);
        r.unregister().then(() => console.log('SW unregistered'));
      });
    } else {
      console.log('✅ OK: No hay Service Workers');
    }
  });
```

**Resultado esperado:** `SW registrations: 0`

---

### 2. Verificar que no hay Auto-Reload

**En consola:**
```javascript
// Interceptar cualquier reload automático
let reloadCount = 0;
const originalReload = window.location.reload;
window.location.reload = function() {
  reloadCount++;
  console.error('❌ AUTO-RELOAD DETECTADO #' + reloadCount);
  console.trace('Stack trace:');
  return originalReload.apply(this, arguments);
};

// Después de 10 segundos, verificar
setTimeout(() => {
  if (reloadCount > 0) {
    console.error('❌ ERROR: Se detectaron', reloadCount, 'auto-reloads');
  } else {
    console.log('✅ OK: No hay auto-reloads');
  }
}, 10000);
```

**Resultado esperado:** `✅ OK: No hay auto-reloads`

---

### 3. Verificar Árbol React Estable

**Inspeccionar en DevTools:**
1. Abrir React DevTools (si está disponible)
2. Buscar componentes que cambian por viewport
3. Verificar que `page-router.tsx` siempre renderiza ambas versiones (mobile + desktop)

**Comando en consola:**
```javascript
// Verificar que no hay renderizado condicional problemático
const scripts = document.querySelectorAll('script[src*=".js"]');
console.log('Total scripts:', scripts.length);

// Verificar que los componentes principales están cargados
const hasDesktopComponents = document.querySelector('.hidden.md\\:block');
const hasMobileComponents = document.querySelector('.block.md\\:hidden');

console.log('Desktop wrapper:', hasDesktopComponents ? '✅' : '❌');
console.log('Mobile wrapper:', hasMobileComponents ? '✅' : '❌');
```

**Resultado esperado:** Ambos wrappers presentes

---

## 🧪 Tests Manuales en Móvil

### Test 1: Carga Inicial
**Pasos:**
1. Limpiar cache del navegador completamente
2. Limpiar Service Workers (si existen)
3. Cargar la app en móvil
4. Observar consola por 30 segundos

**✅ Éxito si:**
- La app carga correctamente
- No hay errores de `removeChild` en consola
- No hay loops infinitos
- No hay auto-reloads

**❌ Falla si:**
- Errores repetidos de `removeChild`
- Página se recarga automáticamente
- Bucle infinito de errores

---

### Test 2: Cambio de Orientación
**Pasos:**
1. Cargar app en modo vertical
2. Cambiar a modo horizontal
3. Volver a vertical
4. Repetir 3 veces

**✅ Éxito si:**
- La UI se adapta correctamente
- No hay errores en consola
- No se recarga la página
- Los componentes no desaparecen/reaparecen

**❌ Falla si:**
- Errores `removeChild` al cambiar orientación
- Componentes desaparecen
- Página se recarga

---

### Test 3: Navegación entre Páginas
**Pasos:**
1. Ir a Dashboard
2. Ir a Prompts
3. Ir a Tools
4. Ir a Snippets
5. Volver a Dashboard
6. Cambiar orientación durante navegación

**✅ Éxito si:**
- Todas las páginas cargan correctamente
- No hay errores durante navegación
- Suspense funciona correctamente (loading states)

**❌ Falla si:**
- Errores al cambiar de página
- `ChunkLoadError`
- Componentes no cargan

---

### Test 4: Forzar Error y Verificar UI
**Pasos:**
1. Abrir consola
2. Forzar un error: `throw new Error('Test error')`
3. Verificar que aparece UI de error
4. Verificar que NO se recarga automáticamente
5. Hacer click en botón "Recargar Página"

**✅ Éxito si:**
- Aparece UI de error con botón
- NO hay auto-reload
- El botón manual funciona

**❌ Falla si:**
- Se recarga automáticamente
- No aparece UI de error
- Loop infinito

---

### Test 5: PWA Instalada (si aplica)
**Pasos:**
1. Si la app está instalada como PWA, abrirla
2. Cargar la app
3. Verificar consola
4. Navegar entre páginas
5. Cambiar orientación

**✅ Éxito si:**
- Funciona igual que en navegador
- No hay errores específicos de PWA
- Service Worker sigue deshabilitado

---

## 🔍 Verificaciones Específicas de Errores

### Verificar removeChild Errors
**En consola, ejecutar:**
```javascript
// Monitorear errores de removeChild
let removeChildErrors = 0;
window.addEventListener('error', (e) => {
  if (e.message.includes('removeChild') || e.message.includes('removeChild')) {
    removeChildErrors++;
    console.error('❌ removeChild error #' + removeChildErrors, e);
  }
});

// Después de 30 segundos
setTimeout(() => {
  if (removeChildErrors > 0) {
    console.error('❌ ERROR: Se encontraron', removeChildErrors, 'errores removeChild');
  } else {
    console.log('✅ OK: No hay errores removeChild');
  }
}, 30000);
```

---

### Verificar React Error #31 / #185
**En consola:**
```javascript
let reactErrors = 0;
window.addEventListener('error', (e) => {
  const msg = e.message.toLowerCase();
  if (msg.includes('react error #31') || 
      msg.includes('react error #185') ||
      msg.includes('$$typeof') ||
      msg.includes('objects are not valid')) {
    reactErrors++;
    console.error('❌ React error #' + reactErrors, e);
  }
});

setTimeout(() => {
  if (reactErrors > 0) {
    console.error('❌ ERROR: Se encontraron', reactErrors, 'React errors');
  } else {
    console.log('✅ OK: No hay React errors');
  }
}, 30000);
```

---

### Verificar ChunkLoadError
**En consola:**
```javascript
let chunkErrors = 0;
window.addEventListener('error', (e) => {
  if (e.message.includes('ChunkLoadError') || 
      e.message.includes('Failed to fetch dynamically imported module')) {
    chunkErrors++;
    console.error('❌ ChunkLoadError #' + chunkErrors, e);
  }
});

setTimeout(() => {
  if (chunkErrors > 0) {
    console.error('❌ ERROR: Se encontraron', chunkErrors, 'ChunkLoadErrors');
  } else {
    console.log('✅ OK: No hay ChunkLoadErrors');
  }
}, 30000);
```

---

## 📱 Testing en Diferentes Dispositivos

### Dispositivos a Probar:
1. **Android (Chrome)**
   - Versión reciente
   - Versión antigua (si es posible)

2. **iOS (Safari)**
   - iPhone reciente
   - iPad

3. **Navegadores:**
   - Chrome Mobile
   - Safari Mobile
   - Firefox Mobile (opcional)

### Configuraciones:
- **Conexión rápida (WiFi)**
- **Conexión lenta (3G/4G)**
- **Modo offline** (verificar que no rompe)

---

## 🛠️ Comandos Útiles para Debugging

### Limpiar Todo (ejecutar antes de cada test)
```javascript
// Limpiar Service Workers
navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(r => r.unregister()));

// Limpiar cache
if ('caches' in window) {
  caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
}

// Limpiar localStorage/sessionStorage
localStorage.clear();
sessionStorage.clear();

// Recargar
location.reload();
```

---

### Monitoreo Completo (copiar y pegar en consola)
```javascript
// Monitoreo completo de errores
const errorReport = {
  removeChild: 0,
  react31: 0,
  react185: 0,
  chunkLoad: 0,
  autoReloads: 0,
  other: []
};

// Interceptar reloads
let reloadCount = 0;
const originalReload = window.location.reload;
window.location.reload = function() {
  reloadCount++;
  errorReport.autoReloads++;
  console.error('🔄 AUTO-RELOAD #' + reloadCount);
  return originalReload.apply(this, arguments);
};

// Monitorear errores
window.addEventListener('error', (e) => {
  const msg = e.message.toLowerCase();
  if (msg.includes('removechild')) {
    errorReport.removeChild++;
    console.error('❌ removeChild error', e);
  } else if (msg.includes('react error #31') || msg.includes('$$typeof')) {
    errorReport.react31++;
    console.error('❌ React Error #31', e);
  } else if (msg.includes('react error #185')) {
    errorReport.react185++;
    console.error('❌ React Error #185', e);
  } else if (msg.includes('chunk') || msg.includes('failed to fetch')) {
    errorReport.chunkLoad++;
    console.error('❌ ChunkLoadError', e);
  } else {
    errorReport.other.push({msg: e.message, stack: e.error?.stack});
  }
});

// Reporte después de 60 segundos
setTimeout(() => {
  console.log('📊 REPORTE DE ERRORES (últimos 60s):');
  console.log('- removeChild:', errorReport.removeChild);
  console.log('- React Error #31:', errorReport.react31);
  console.log('- React Error #185:', errorReport.react185);
  console.log('- ChunkLoadError:', errorReport.chunkLoad);
  console.log('- Auto-reloads:', errorReport.autoReloads);
  console.log('- Otros errores:', errorReport.other.length);
  
  if (errorReport.removeChild > 0 || 
      errorReport.react31 > 0 || 
      errorReport.react185 > 0 ||
      errorReport.autoReloads > 0) {
    console.error('❌ TEST FALLIDO: Se encontraron errores críticos');
  } else {
    console.log('✅ TEST EXITOSO: No hay errores críticos');
  }
}, 60000);
```

---

## ✅ Criterios de Éxito Final

La versión móvil se considera **estable** si:

1. ✅ **Service Worker:** 0 registrations
2. ✅ **Auto-reloads:** 0 en 60 segundos
3. ✅ **removeChild errors:** 0 en 60 segundos
4. ✅ **React Error #31/#185:** 0 en 60 segundos
5. ✅ **ChunkLoadError:** 0 en 60 segundos
6. ✅ **Navegación:** Funciona correctamente
7. ✅ **Orientación:** Cambios sin errores
8. ✅ **Error UI:** Aparece correctamente sin auto-reload

---

## 🚨 Si Encuentras Errores

### 1. Capturar Información:
```javascript
// Ejecutar cuando ocurra el error
console.log('Device:', navigator.userAgent);
console.log('Viewport:', window.innerWidth, 'x', window.innerHeight);
console.log('Service Workers:', (await navigator.serviceWorker.getRegistrations()).length);
console.log('Caches:', await caches.keys());
console.log('React version:', React.version); // Si está disponible
```

### 2. Revisar Logs:
- Console del navegador
- Network tab (verificar requests fallidos)
- React DevTools (si está disponible)

### 3. Verificar Fixes:
- Service Worker deshabilitado en código
- ErrorBoundary sin auto-reload
- page-router usando CSS (no condicionales)

---

## 📝 Notas Adicionales

- **Testing mínimo:** 5 minutos de uso normal en móvil sin errores
- **Testing ideal:** 30 minutos en diferentes escenarios
- **Production:** Monitorear errores reales con Sentry/LogRocket (opcional)
