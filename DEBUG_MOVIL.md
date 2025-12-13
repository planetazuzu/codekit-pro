# 🔍 Debug: App no se ve en móvil

## Problemas Identificados

### 1. ✅ Corregido: Error en Service Worker
- **Error**: Variable `url` declarada dos veces (líneas 69 y 107)
- **Fix**: Eliminada declaración duplicada, código limpiado

### 2. ⚠️ Pendiente: Error React.forwardRef
- **Error**: `Cannot read properties of undefined (reading 'forwardRef')`
- **Causa**: Chunk `ui-vendor` no tiene acceso a React
- **Estado**: Ajustado code-splitting, pendiente verificación en producción

## Posibles Causas de "No se ve en móvil"

### 1. Error de JavaScript bloquea render
- Si el error de `React.forwardRef` persiste, puede bloquear toda la app
- **Solución**: Verificar consola del navegador en móvil

### 2. Service Worker bloqueando recursos
- Service Worker puede estar cacheando versión antigua
- **Solución**: Limpiar Service Worker y recargar

### 3. Endpoint `/api/stats` no disponible
- Si el endpoint falla, Dashboard puede no renderizar
- **Solución**: Verificar que el endpoint esté desplegado

### 4. Problema de CSP (Content Security Policy)
- Puede estar bloqueando recursos en móvil
- **Solución**: Verificar headers de seguridad

## Pasos para Debug

### 1. Verificar en móvil (Chrome DevTools)
1. Abrir Chrome DevTools (F12)
2. Activar "Device Toolbar" (Ctrl+Shift+M)
3. Seleccionar dispositivo móvil
4. Abrir consola y verificar errores

### 2. Verificar Service Worker
```javascript
// En consola del navegador
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
// Recargar página
```

### 3. Verificar endpoint `/api/stats`
```bash
curl https://codekitpro.app/api/stats
# Debe devolver: {"success":true,"data":{"prompts":X,"snippets":Y,...}}
```

### 4. Verificar errores en consola
- Abrir consola del navegador
- Buscar errores en rojo
- Verificar si hay errores de:
  - `React.forwardRef`
  - `Cannot read properties`
  - `Failed to fetch`
  - `Service Worker`

## Soluciones Rápidas

### Si el error de React.forwardRef persiste:
1. Desplegar versión con React y Radix UI en mismo chunk
2. O incluir React en chunk principal

### Si Service Worker está bloqueando:
1. Desregistrar Service Worker
2. Limpiar cache
3. Recargar página

### Si endpoint `/api/stats` falla:
1. Verificar que esté desplegado en servidor
2. Verificar logs del servidor
3. Verificar que la ruta esté registrada

## Comandos de Verificación

```bash
# En servidor
cd /var/www/codekit-pro
docker compose logs app | grep -i "stats\|error"
curl http://localhost:8604/api/stats

# Verificar que el endpoint existe
docker compose exec app curl http://localhost:8604/api/stats
```

---

**Fecha:** 2025-12-13  
**Estado:** ⚠️ Pendiente verificación en producción

