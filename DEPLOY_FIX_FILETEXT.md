# 🚀 Despliegue - Fix FileText Import

## ✅ Cambios Realizados

- **Archivo:** `client/src/layout/Sidebar.tsx`
- **Problema:** `FileText` no estaba siendo incluido correctamente en el bundle de producción
- **Solución:** Import renombrado y constante explícita para asegurar inclusión en bundle

## 📋 Pasos para Desplegar

### 1. Verificar Cambios Locales
```bash
cd /home/planetazuzu/CodeKit\ Pro
git status
git diff client/src/layout/Sidebar.tsx
```

### 2. Commit y Push
```bash
git add .
git commit -m "Fix: corregir import de FileText en Sidebar para evitar error en producción"
git push origin main
```

### 3. Desplegar en Servidor

**Conectarse al servidor:**
```bash
ssh root@207.180.226.141
```

**Ejecutar despliegue:**
```bash
cd /var/www/codekit-pro

# Actualizar código
git pull origin main

# Reconstruir y reiniciar
docker compose down
docker compose build --no-cache app
docker compose up -d

# Verificar que está funcionando
sleep 10
docker compose ps
docker compose logs --tail=50 app

# Verificar health
curl http://localhost:8604/api/health
```

### 4. Limpiar Service Worker (Una vez en el navegador)

**En Chrome/Edge:**
1. Abre DevTools (F12)
2. Ve a **Application** → **Service Workers**
3. Click en **Unregister** para el Service Worker de codekitpro.app
4. Ve a **Application** → **Storage**
5. Click en **Clear site data**
6. Cierra y vuelve a abrir la pestaña
7. Hard reload: `Ctrl+Shift+R` (Windows/Linux) o `Cmd+Shift+R` (Mac)

**En Firefox:**
1. Abre DevTools (F12)
2. Ve a **Application** → **Service Workers**
3. Click en **Unregister**
4. Ve a **Storage** → **Clear All**
5. Hard reload: `Ctrl+Shift+R`

## ✅ Verificación Post-Despliegue

1. **Verificar que la app carga:**
   - Abre https://codekitpro.app
   - Debe cargar sin bucle infinito
   - El favicon debe aparecer correctamente

2. **Verificar que el Sidebar funciona:**
   - Click en el menú hamburguesa
   - Verifica que "Documentación" aparece con el icono FileText
   - Navega a `/docs` y verifica que funciona

3. **Verificar en consola:**
   - Abre DevTools → Console
   - No debe haber errores de `FileText is not defined`
   - No debe haber errores de `Layout-Bj6ZCZHY.js`

## 🔍 Si Aún Hay Problemas

### Ver logs del servidor:
```bash
docker compose logs --tail=100 app
```

### Verificar que el build incluye FileText:
```bash
docker compose exec app grep -r "FileText" /app/dist/public/assets/ | head -5
```

### Forzar rebuild completo:
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

## 📝 Notas

- El problema era que `FileText` se usaba en un array de objetos, y el tree-shaking del bundler no lo detectaba correctamente
- La solución fue crear una constante explícita `const FileText = FileTextIcon;` para forzar su inclusión
- Este tipo de problemas solo aparecen en producción porque en desarrollo Vite incluye todo

---

**Fecha:** 2025-12-13  
**Estado:** Listo para desplegar

