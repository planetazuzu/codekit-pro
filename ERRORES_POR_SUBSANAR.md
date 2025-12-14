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

**Estado:** ⚠️ Parcialmente resuelto - Necesita testing en producción
**Notas adicionales:**
- El archivo existe localmente pero puede fallar en Docker si los paths no se resuelven correctamente
- Agregado logging detallado para debugging
- Agregados múltiples paths alternativos para encontrar el archivo en diferentes entornos
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
