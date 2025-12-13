# 🔍 Verificar Configuración del Webhook

## Pasos para diagnosticar el problema

### 1. Verificar que el endpoint del webhook está registrado

En el servidor, ejecuta:

```bash
cd /var/www/codekit-pro
docker compose logs app | grep -i webhook
```

O verifica directamente:

```bash
curl http://localhost:8604/api/webhooks/status
```

Deberías ver:
```json
{
  "configured": true,
  "message": "Webhook endpoint is configured"
}
```

### 2. Verificar variables de entorno en el servidor

```bash
cd /var/www/codekit-pro
docker compose exec app printenv | grep -E "WEBHOOK_SECRET|USE_DOCKER|PROJECT_DIR"
```

**Debe mostrar:**
- `WEBHOOK_SECRET=...` (debe tener un valor)
- `USE_DOCKER=true` (si usas Docker)
- `PROJECT_DIR=/var/www/codekit-pro` (opcional, tiene valor por defecto)

### 3. Verificar que el endpoint está accesible

```bash
# Desde el servidor
curl -X POST http://localhost:8604/api/webhooks/deploy \
  -H "Authorization: Bearer TU_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main","commit":"test"}'
```

**Si funciona**, deberías ver:
```json
{
  "success": true,
  "message": "Deployment triggered successfully",
  ...
}
```

**Si no funciona**, verifica:
- Que el servidor esté corriendo: `docker compose ps`
- Que el puerto 8604 esté abierto: `netstat -tlnp | grep 8604`
- Los logs del servidor: `docker compose logs --tail=50 app`

### 4. Verificar configuración en GitHub

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Verifica que existan estos secrets:
   - `WEBHOOK_SECRET` (debe coincidir con el del servidor)
   - `WEBHOOK_URL` (debe ser `https://codekitpro.app` o tu dominio)

### 5. Verificar que GitHub Actions está ejecutándose

1. Ve a tu repositorio en GitHub
2. Pestaña "Actions"
3. Verifica que el workflow "🚀 CI/CD Auto Deploy" se ejecute cuando haces push
4. Revisa los logs del step "🔔 Trigger deployment webhook"

**Si falla**, verás el error en los logs.

### 6. Verificar logs del servidor cuando se recibe el webhook

```bash
cd /var/www/codekit-pro
docker compose logs -f app | grep -i "webhook\|deploy"
```

Cuando GitHub envíe el webhook, deberías ver logs como:
```
[INFO] Deployment webhook triggered
[INFO] Executing deployment script: ...
```

### 7. Verificar permisos del script de despliegue

```bash
cd /var/www/codekit-pro
ls -la scripts/deploy-docker-auto.sh
chmod +x scripts/deploy-docker-auto.sh
```

### 8. Probar el despliegue manualmente

```bash
cd /var/www/codekit-pro
bash scripts/deploy-docker-auto.sh
```

Si esto funciona, el problema está en la comunicación entre GitHub y el servidor.

## Problemas comunes y soluciones

### ❌ Error: "WEBHOOK_SECRET not configured"
**Solución:** Añade `WEBHOOK_SECRET` al archivo `.env` en el servidor:
```bash
cd /var/www/codekit-pro
echo "WEBHOOK_SECRET=tu_secret_aqui" >> .env
docker compose restart app
```

### ❌ Error: "Invalid webhook secret"
**Solución:** Verifica que el `WEBHOOK_SECRET` en GitHub Actions sea el mismo que en el servidor.

### ❌ Error: "Connection refused" o timeout
**Solución:** 
- Verifica que el servidor esté corriendo
- Verifica que el puerto 8604 esté abierto en el firewall
- Verifica que `WEBHOOK_URL` en GitHub apunte al dominio correcto

### ❌ El webhook se recibe pero no se ejecuta el despliegue
**Solución:**
- Verifica los logs del servidor: `docker compose logs app`
- Verifica que `USE_DOCKER=true` esté en el `.env`
- Verifica permisos del script: `chmod +x scripts/deploy-docker-auto.sh`

### ❌ GitHub Actions no ejecuta el workflow
**Solución:**
- Verifica que el archivo `.github/workflows/webhook-deploy.yml` existe
- Verifica que estás haciendo push a la rama `main` o `master`
- Verifica que los secrets están configurados en GitHub

## Comando rápido para verificar todo

```bash
cd /var/www/codekit-pro && \
echo "=== Estado del servidor ===" && \
docker compose ps && \
echo "" && \
echo "=== Variables de entorno ===" && \
docker compose exec app printenv | grep -E "WEBHOOK_SECRET|USE_DOCKER|PROJECT_DIR" && \
echo "" && \
echo "=== Estado del webhook ===" && \
curl -s http://localhost:8604/api/webhooks/status | jq . && \
echo "" && \
echo "=== Últimos logs ===" && \
docker compose logs --tail=20 app | grep -i "webhook\|deploy" || echo "No hay logs recientes de webhook"
```

