# 🚀 Comandos para Desplegar en el Servidor

## 📋 Comandos Completos

### Opción 1: Todo en uno (Recomendado)

```bash
cd /var/www/codekit-pro && \
git pull origin main && \
docker compose down && \
docker compose build --no-cache app && \
docker compose up -d && \
sleep 15 && \
docker compose ps && \
echo "" && \
echo "=== Verificando salud ===" && \
curl -s http://localhost:8604/api/health | jq . || curl -s http://localhost:8604/api/health
```

### Opción 2: Paso a paso

```bash
# 1. Ir al directorio del proyecto
cd /var/www/codekit-pro

# 2. Actualizar código desde GitHub
git pull origin main

# 3. Detener contenedores
docker compose down

# 4. Reconstruir imagen (sin cache para asegurar cambios)
docker compose build --no-cache app

# 5. Iniciar contenedores
docker compose up -d

# 6. Esperar a que se inicie
sleep 15

# 7. Verificar estado
docker compose ps

# 8. Verificar salud de la app
curl http://localhost:8604/api/health

# 9. Ver logs recientes
docker compose logs --tail=50 app
```

## 🔍 Verificación Post-Despliegue

### 1. Verificar contenedores
```bash
docker compose ps
```
**Esperado**: Ambos contenedores (`codekit-pro` y `codekit-postgres`) deben estar `Up` y `healthy`.

### 2. Verificar salud de la app
```bash
curl http://localhost:8604/api/health
```
**Esperado**: `{"success":true,"status":"healthy",...}`

### 3. Verificar endpoint de stats
```bash
curl http://localhost:8604/api/stats
```
**Esperado**: `{"success":true,"data":{"prompts":X,"snippets":Y,...}}`

### 4. Ver logs si hay problemas
```bash
docker compose logs --tail=100 app | grep -i error
```

### 5. Verificar en el navegador
- Abrir: https://codekitpro.app
- Abrir consola (F12)
- Verificar que no hay errores de:
  - `forwardRef`
  - `Activity`
  - Chunks

## 🧹 Limpiar Service Worker (si es necesario)

Si hay problemas de cache, ejecutar en consola del navegador:

```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
  console.log('Service Worker desregistrado');
});
// Luego recargar: Ctrl+Shift+R
```

## ⚠️ Si algo falla

### Ver logs completos
```bash
docker compose logs app
```

### Reiniciar contenedor
```bash
docker compose restart app
```

### Reconstruir desde cero
```bash
docker compose down -v
docker compose build --no-cache app
docker compose up -d
```

## 📝 Notas

- El build puede tardar 1-2 minutos
- El contenedor tarda ~15 segundos en iniciarse
- Si hay errores, revisar logs con `docker compose logs app`
- El endpoint `/api/health` debe responder antes de considerar el despliegue exitoso

---

**Última actualización**: 2025-12-13

