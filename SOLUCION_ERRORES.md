# 🔧 Solución Completa para Errores

## Problemas Identificados

1. ✅ **Errores 500 en API** - Base de datos sin tablas
2. ✅ **Errores 502 Bad Gateway** - Servidor no responde o proxy mal configurado
3. ✅ **CSP bloqueando Google Fonts** - Service worker interceptando fuentes
4. ✅ **MIME types incorrectos** - Archivos JS servidos como HTML

## Solución Paso a Paso

### 1. Actualizar Código y Reconstruir

```bash
cd /var/www/codekit-pro

# Actualizar código
git pull origin main

# Detener contenedores
docker compose down

# Reconstruir imagen (incluye todas las correcciones)
docker compose build --no-cache

# Iniciar contenedores
docker compose up -d

# Esperar a que estén listos
sleep 15
```

### 2. Crear Tablas de Base de Datos

```bash
# Verificar que drizzle-kit esté disponible
docker compose exec app drizzle-kit --version

# Crear las tablas
docker compose exec app drizzle-kit push

# Verificar que se crearon las tablas
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "\dt"
```

**Deberías ver:** users, prompts, snippets, links, guides, views, affiliates, affiliate_clicks, affiliate_programs

### 3. Verificar Estado del Servidor

```bash
# Ver estado de contenedores
docker compose ps

# Ver logs del servidor
docker compose logs --tail=50 app

# Verificar que el servidor responda
curl -f http://localhost:8604/health

# Debería devolver: {"status":"ok","timestamp":"..."}
```

### 4. Verificar Archivos Estáticos

```bash
# Verificar que los archivos JS existan
docker compose exec app ls -la /app/dist/public/assets/ | head -10

# Verificar MIME type de un archivo JS
curl -I http://localhost:8604/assets/index-*.js | grep Content-Type

# Debería mostrar: Content-Type: application/javascript
```

### 5. Si Hay Errores 502 (Bad Gateway)

Los errores 502 generalmente indican:
- El servidor no está corriendo
- El proxy (Nginx Proxy Manager) está mal configurado
- El puerto no es accesible

**Verificar:**

```bash
# Verificar que el contenedor esté corriendo
docker compose ps app

# Ver logs de errores
docker compose logs app | grep -i error

# Verificar que el puerto esté expuesto
docker compose ps | grep 8604

# Probar desde dentro del contenedor
docker compose exec app curl -f http://localhost:8604/health
```

**Si usas Nginx Proxy Manager:**

1. Verifica que el proxy apunte a `http://localhost:8604` (o `http://127.0.0.1:8604`)
2. Verifica que el dominio `codekitpro.app` esté configurado correctamente
3. Asegúrate de que el SSL esté configurado si usas HTTPS

### 6. Limpiar Cache del Navegador

Después de todos los cambios:

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Application" o "Aplicación"
3. Haz clic en "Clear storage" o "Limpiar almacenamiento"
4. Marca todas las opciones
5. Haz clic en "Clear site data" o "Limpiar datos del sitio"
6. Recarga la página con `Ctrl+Shift+R` (hard refresh)

### 7. Desregistrar Service Worker Antiguo

Si el service worker antiguo sigue causando problemas:

1. Abre las herramientas de desarrollador (F12)
2. Ve a "Application" > "Service Workers"
3. Haz clic en "Unregister" para el service worker activo
4. Recarga la página

## Verificación Final

Después de todos los pasos, verifica:

```bash
# 1. Servidor respondiendo
curl -f http://localhost:8604/health

# 2. API funcionando (debería devolver datos, no 500)
curl http://localhost:8604/api/prompts

# 3. Archivos estáticos con MIME correcto
curl -I http://localhost:8604/assets/index-*.js | grep Content-Type

# 4. Tablas creadas
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "\dt" | wc -l
# Debería mostrar al menos 8 tablas
```

## Si Algo Sigue Fallando

### Ver logs completos:

```bash
# Logs de la aplicación
docker compose logs app > app_logs.txt

# Logs de PostgreSQL
docker compose logs postgres > postgres_logs.txt

# Ver errores específicos
docker compose logs app 2>&1 | grep -i -E "error|fail|500|502"
```

### Reiniciar desde cero:

```bash
cd /var/www/codekit-pro

# Detener todo
docker compose down -v

# Eliminar imágenes antiguas (opcional)
docker rmi codekit-pro-app

# Reconstruir
docker compose build --no-cache
docker compose up -d

# Esperar y crear tablas
sleep 20
docker compose exec app drizzle-kit push
```

## Resumen de Correcciones Aplicadas

✅ **CSP**: Agregado `fonts.googleapis.com` y `fonts.gstatic.com` a `connect-src`  
✅ **Service Worker**: No intercepta Google Fonts ni recursos externos  
✅ **MIME Types**: Configurados correctamente para archivos JS/CSS  
✅ **Archivos Estáticos**: Catch-all mejorado para no interferir con archivos  
✅ **Dockerfile**: Incluye `drizzle-kit` globalmente para crear tablas  
✅ **Meta Tags**: Corregido tag deprecado de Apple

## Comandos Rápidos de Diagnóstico

```bash
cd /var/www/codekit-pro && \
echo "=== ESTADO ===" && \
docker compose ps && \
echo "" && \
echo "=== HEALTH CHECK ===" && \
curl -s http://localhost:8604/health && \
echo "" && \
echo "=== TABLAS ===" && \
docker compose exec postgres psql -U codekit_user -d codekit_pro -c "\dt" | head -15 && \
echo "" && \
echo "=== LOGS RECIENTES ===" && \
docker compose logs --tail=20 app | grep -i -E "error|warn|info" | tail -10
```

