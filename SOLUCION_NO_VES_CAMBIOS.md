# 🔧 Solución: No Ves los Cambios en la App

## Problema
Después de un despliegue automático, no ves las mejoras en la aplicación.

## Solución Rápida

### Opción 1: Forzar Despliegue Manual (Recomendado)

Conecta al servidor y ejecuta:

```bash
ssh root@207.180.226.141
cd /var/www/codekit-pro
bash scripts/forzar-despliegue-manual.sh
```

Este script:
1. ✅ Actualiza el código desde Git
2. ✅ Reconstruye la imagen Docker
3. ✅ Reinicia el contenedor
4. ✅ Verifica que todo funciona

### Opción 2: Verificar Estado Primero

Si quieres diagnosticar primero:

```bash
ssh root@207.180.226.141
cd /var/www/codekit-pro
bash scripts/verificar-despliegue.sh
```

Este script te mostrará:
- Estado de Git (si hay commits pendientes)
- Estado de Docker
- Estado de contenedores
- Logs recientes
- Si el webhook funcionó

### Opción 3: Comandos Manuales

Si prefieres hacerlo paso a paso:

```bash
ssh root@207.180.226.141
cd /var/www/codekit-pro

# 1. Actualizar código
git pull origin main

# 2. Reconstruir imagen
docker compose build app

# 3. Reiniciar contenedor
docker compose restart app

# 4. Esperar y verificar
sleep 15
curl http://localhost:8604/health
```

## Limpiar Caché del Navegador

Después del despliegue, limpia la caché:

### Chrome/Edge
1. Abre DevTools (F12)
2. Click derecho en el botón de recargar
3. Selecciona "Vaciar caché y volver a cargar de manera forzada"

O manualmente:
1. DevTools (F12) > Application > Clear Storage
2. Click "Clear site data"
3. Recarga con Ctrl+Shift+R

### Firefox
1. Ctrl+Shift+Delete
2. Selecciona "Caché"
3. Click "Limpiar ahora"
4. Recarga con Ctrl+Shift+R

## Verificar Service Worker

El Service Worker puede estar cacheando la versión antigua:

1. Abre DevTools (F12)
2. Ve a Application > Service Workers
3. Si hay un Service Worker activo, click "Unregister"
4. Recarga la página

## Verificar que Funcionó

Después del despliegue, verifica:

1. **Health check:**
   ```bash
   curl http://localhost:8604/health
   ```

2. **Nueva ruta de docs:**
   ```bash
   curl http://localhost:8604/api/docs/README.md
   ```

3. **En el navegador:**
   - Ve a: `https://codekitpro.app/docs`
   - Deberías ver la nueva sección de documentación

## Por Qué Puede Pasar Esto

### 1. El Webhook No Se Ejecutó
- El servidor puede no haber recibido el webhook
- El webhook puede haber fallado silenciosamente
- El script puede no haberse ejecutado correctamente

### 2. Git Pull Falló
- Problemas de permisos
- El directorio no es el correcto
- Problemas de red

### 3. Docker Build No Incluyó Cambios
- La imagen se construyó antes del `git pull`
- Problemas con el contexto de build

### 4. Caché del Navegador
- El navegador está mostrando versión antigua
- Service Worker está cacheando

## Prevención

Para evitar esto en el futuro:

1. **Verificar logs después de cada despliegue:**
   ```bash
   docker compose logs app --tail=50 | grep -i "deploy\|webhook"
   ```

2. **Monitorear GitHub Actions:**
   - Ve a: https://github.com/planetazuzu/codekit-pro/actions
   - Verifica que el workflow se complete exitosamente

3. **Configurar notificaciones:**
   - Cuando se implemente, recibirás notificaciones de despliegues

## Si Nada Funciona

Si después de todo esto no ves los cambios:

1. **Verifica los logs completos:**
   ```bash
   docker compose logs app --tail=200
   ```

2. **Verifica que el código está actualizado:**
   ```bash
   git log --oneline -1
   # Debería mostrar el commit más reciente
   ```

3. **Verifica que Docker tiene el código nuevo:**
   ```bash
   docker compose exec app ls -la /app/dist
   ```

4. **Contacta para soporte:**
   - Proporciona los logs
   - Proporciona el output de `git status`
   - Proporciona el output de `docker compose ps`

