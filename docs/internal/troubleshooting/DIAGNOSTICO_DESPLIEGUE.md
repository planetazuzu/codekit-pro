# 🔍 Diagnóstico de Despliegue

## Problema Reportado
Las mejoras no se ven en la aplicación después del despliegue automático.

## Posibles Causas

### 1. El webhook no se ejecutó correctamente
- El servidor puede no haber recibido el webhook
- El webhook puede haber fallado silenciosamente
- El script de despliegue puede no haberse ejecutado

### 2. El script de despliegue falló
- `git pull` puede haber fallado
- El build puede haber fallado
- Docker Compose puede no haber reiniciado correctamente

### 3. Caché del navegador
- El navegador puede estar mostrando una versión en caché
- Service Worker puede estar cacheando la versión antigua

### 4. El servidor no tiene los últimos cambios
- El `git pull` puede no haber funcionado
- El código puede estar en una rama diferente

## Pasos de Diagnóstico

### Paso 1: Verificar logs del servidor

```bash
ssh root@207.180.226.141
cd /var/www/codekit-pro

# Ver logs de la aplicación
docker compose logs app --tail=100 | grep -i "deploy\|webhook\|error"

# Ver logs de webhook específicamente
docker compose logs app --tail=200 | grep -i webhook
```

### Paso 2: Verificar estado de Git en el servidor

```bash
cd /var/www/codekit-pro

# Ver último commit
git log --oneline -1

# Ver estado
git status

# Ver si hay cambios sin pull
git fetch origin
git log HEAD..origin/main --oneline
```

### Paso 3: Verificar que el webhook se recibió

```bash
# Ver logs de webhook
docker compose logs app | grep -i "deployment webhook triggered"

# Verificar estado del webhook
curl http://localhost:8604/api/webhooks/status
```

### Paso 4: Forzar despliegue manual

```bash
cd /var/www/codekit-pro

# Hacer pull manual
git pull origin main

# Reconstruir y reiniciar
docker compose build app
docker compose up -d app

# Ver logs
docker compose logs app --tail=50 -f
```

### Paso 5: Limpiar caché del navegador

1. Abrir DevTools (F12)
2. Ir a Application > Clear Storage
3. Hacer "Clear site data"
4. Recargar con Ctrl+Shift+R (hard refresh)

### Paso 6: Verificar Service Worker

```bash
# En el navegador, abrir DevTools > Application > Service Workers
# Hacer "Unregister" si hay un service worker activo
# Recargar la página
```

## Solución Rápida

Si el despliegue automático no funcionó, ejecuta esto en el servidor:

```bash
ssh root@207.180.226.141
cd /var/www/codekit-pro

# Actualizar código
git pull origin main

# Reconstruir imagen
docker compose build app

# Reiniciar contenedor
docker compose restart app

# Esperar y verificar
sleep 15
curl http://localhost:8604/health
curl http://localhost:8604/api/webhooks/status
```

## Verificación Final

Después de forzar el despliegue, verifica:

1. **Health check:** `curl http://localhost:8604/health`
2. **Nueva ruta:** `curl http://localhost:8604/api/docs/README.md`
3. **En el navegador:** `https://codekitpro.app/docs`

Si todo funciona, el problema era que el despliegue automático no se ejecutó correctamente.

