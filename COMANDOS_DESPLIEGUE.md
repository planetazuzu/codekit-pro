# 🚀 Comandos para Desplegar Fix FileText

## ✅ Estado Actual
- ✅ Build local exitoso
- ✅ FileText import corregido en Sidebar.tsx
- ✅ Sin errores de linting
- ✅ Listo para commit y push

## 📋 Pasos de Despliegue

### 1. Commit y Push (Local)
```bash
cd "/home/planetazuzu/CodeKit Pro"
git add .
git commit -m "Fix: corregir import de FileText en Sidebar para evitar error en producción"
git push origin main
```

### 2. Desplegar en Servidor (SSH)
```bash
# Conectarse al servidor
ssh root@207.180.226.141

# Ejecutar despliegue
cd /var/www/codekit-pro
git pull origin main
docker compose down
docker compose build --no-cache app
docker compose up -d

# Verificar
sleep 15
docker compose ps
docker compose logs --tail=30 app
curl http://localhost:8604/api/health
```

### 3. Limpiar Service Worker (Navegador - Una vez)

**Chrome/Edge:**
1. F12 → Application → Service Workers → Unregister
2. Application → Storage → Clear site data
3. Ctrl+Shift+R (hard reload)

**Firefox:**
1. F12 → Application → Service Workers → Unregister
2. Storage → Clear All
3. Ctrl+Shift+R (hard reload)

## ✅ Verificación Post-Despliegue

1. ✅ App carga sin bucle infinito
2. ✅ Sidebar muestra "Documentación" con icono
3. ✅ Navegación a `/docs` funciona
4. ✅ Console sin errores de `FileText is not defined`

---

**Fecha:** 2025-12-13  
**Fix:** FileText import en Sidebar.tsx

