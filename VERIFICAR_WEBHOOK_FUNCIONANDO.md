# ✅ Verificar Webhook Funcionando

## 🔍 Diagnóstico del Problema

El error "Connection reset by peer" puede ser porque:
1. La aplicación está iniciando (necesita más tiempo)
2. El curl está intentando antes de que esté lista
3. Necesita verificar desde dentro del contenedor

## ✅ Solución: Verificar Correctamente

### Paso 1: Esperar a que la aplicación esté completamente lista

```bash
# En el servidor
cd /var/www/codekit-pro

# Esperar 10-15 segundos después del reinicio
sleep 15

# Verificar health check desde dentro del contenedor
docker compose exec app curl -f http://localhost:8604/health
```

**Debería responder:**
```json
{"status":"ok","timestamp":"2025-12-12T19:37:29.914Z"}
```

### Paso 2: Verificar Webhook desde dentro del contenedor

```bash
# Verificar webhook desde dentro del contenedor
docker compose exec app curl http://localhost:8604/api/webhooks/status
```

**Debería responder:**
```json
{
  "configured": true,
  "message": "Webhook endpoint is configured"
}
```

### Paso 3: Verificar desde el host (puerto mapeado)

```bash
# Verificar desde el host usando el puerto mapeado
curl http://localhost:8604/api/webhooks/status

# O desde fuera del servidor (si el puerto está expuesto)
curl http://207.180.226.141:8604/api/webhooks/status
```

## 🎯 Comandos de Verificación Completa

```bash
cd /var/www/codekit-pro && \
echo "=== Esperando a que la app esté lista ===" && \
sleep 15 && \
echo "" && \
echo "=== Health Check (desde contenedor) ===" && \
docker compose exec app curl -f http://localhost:8604/health && \
echo "" && \
echo "" && \
echo "=== Webhook Status (desde contenedor) ===" && \
docker compose exec app curl http://localhost:8604/api/webhooks/status && \
echo "" && \
echo "" && \
echo "=== Webhook Status (desde host) ===" && \
curl http://localhost:8604/api/webhooks/status 2>&1
```

## 📊 Estado Actual (Según tus Logs)

✅ **Contenedores**: Corriendo y saludables
✅ **Aplicación**: Iniciada correctamente
✅ **Puerto**: Mapeado correctamente (0.0.0.0:8604->8604/tcp)
✅ **Variables**: Cargadas correctamente
✅ **Base de datos**: Conectada

**El problema es solo de timing** - la aplicación necesita unos segundos más para estar completamente lista.

## 🔧 Si Sigue Fallando

### Verificar que la aplicación está escuchando:

```bash
# Verificar procesos dentro del contenedor
docker compose exec app ps aux | grep node

# Verificar que está escuchando en el puerto
docker compose exec app netstat -tlnp 2>/dev/null | grep 8604 || \
docker compose exec app ss -tlnp | grep 8604
```

### Ver logs en tiempo real:

```bash
# Ver logs mientras haces el curl
docker compose logs -f app
```

En otra terminal:
```bash
curl http://localhost:8604/api/webhooks/status
```

Observa los logs para ver si hay errores.

## ✅ Próximo Paso

Una vez que el webhook responda correctamente:

1. **Probar el despliegue automático** haciendo un push a GitHub
2. **Monitorear el despliegue** en GitHub Actions y en el servidor
3. **Verificar que los nuevos prompts se cargaron** (los 10 de Vibe Coding)

---

**¡La aplicación está funcionando! Solo necesita unos segundos más para estar completamente lista.** 🚀

