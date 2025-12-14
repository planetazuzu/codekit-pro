# 🐛 Errores y Issues por Subsanar

Este documento rastrea problemas conocidos, errores y código redundante que deben corregirse en el proyecto.

---

## 📋 Lista de Errores

### ❌ 1. Documento no encontrado: `public/README.md`

**Descripción:**
El endpoint `/api/docs` intenta servir `public/README.md` por defecto cuando no se especifica una ruta, pero el archivo no se encuentra o la ruta está mal configurada.

**Error:**
```
Documento no encontrado: public/README.md
El documento no está disponible. Verifica que el archivo existe.
```

**Ubicación del problema:**
- **Servidor:** `server/routes/docs.ts` línea 60
- **Cliente:** `client/src/pages/Docs.tsx` línea 17

**Código problemático:**
```typescript
// server/routes/docs.ts:59-60
if (!requestedPath || requestedPath === "" || requestedPath === "README.md") {
  requestedPath = "public/README.md";
}
```

**Solución aplicada:**
1. ✅ Verificado que `docs/public/README.md` existe
2. ✅ Mejorado el path resolution usando `path.normalize()` para cross-platform
3. ✅ Agregado fallback: si `public/README.md` no se encuentra, intenta rutas alternativas
4. ✅ Agregado mejor logging y mensajes de error más descriptivos
5. ✅ Normalizado paths para prevenir problemas de rutas en diferentes sistemas

**Cambios realizados:**
- Normalización de paths con `path.normalize()`
- Verificación de seguridad mejorada para directory traversal
- Fallback para rutas alternativas cuando el archivo por defecto no se encuentra
- Mejor logging para debugging

**Estado:** ✅ Resuelto (pendiente de deploy)

**Solución implementada:**
1. ✅ **Cambiado el patrón de ruta**: De `/:path*` a `*` para capturar correctamente paths con barras
2. ✅ **Uso de `req.path`**: Ahora usa `req.path` que ya viene sin el prefijo `/api/docs` cuando el router está montado
3. ✅ Mejorado path resolution con múltiples fallbacks
4. ✅ Agregado logging detallado al iniciar el servidor para verificar que encuentra el README
5. ✅ Agregados paths alternativos para diferentes entornos (local, Docker, producción)
6. ✅ Mejor manejo de errores con información de debugging

**Root cause identificado:**
- El patrón `/:path*` en Express no captura correctamente paths con barras como `public/README.md`
- Cambiado a `router.get("*")` que captura todo el path correctamente

**Notas adicionales:**
- El archivo existe localmente (`docs/public/README.md`)
- El Dockerfile copia la carpeta `docs` al contenedor (línea 38)
- Después del deploy, verificar los logs del servidor para ver si encuentra el path correcto
- Si persiste el error, revisar los logs del servidor para ver qué path está usando y por qué no encuentra el archivo

**Verificación post-deploy:**
```bash
# En el servidor, verificar logs
docker compose logs app | grep -i "docs path\|README found"

# Verificar que el archivo existe en el contenedor
docker compose exec app ls -la /app/docs/public/README.md

# Probar el endpoint directamente
curl http://localhost:8604/api/docs/public/README.md
```
**Prioridad:** Media
**Asignado:** -

---

## 🔄 Código Redundante

_(Añadir aquí código duplicado, funciones no usadas, etc.)_

---

## 📝 Notas

- Este archivo se actualiza conforme se identifican nuevos errores
- Cada error debe tener una descripción clara, ubicación y solución propuesta
- Marcar como ✅ cuando se resuelva
