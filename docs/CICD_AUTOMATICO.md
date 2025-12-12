# 🤖 CI/CD Automático - Guía Completa

## 🎯 Objetivo

Configurar un pipeline CI/CD completamente automático que despliega los cambios de GitHub al servidor sin intervención manual.

## 📋 Arquitectura

```
GitHub Push → GitHub Actions → Webhook → Servidor → Docker Deploy
```

## 🔧 Configuración Paso a Paso

### 1. Configurar Secrets en GitHub

Ve a tu repositorio en GitHub:
1. Settings → Secrets and variables → Actions
2. Agrega estos secrets:

```
WEBHOOK_SECRET: tu_secret_seguro_aqui
WEBHOOK_URL: https://codekitpro.app
```

**Generar WEBHOOK_SECRET:**
```bash
openssl rand -hex 32
```

### 2. Configurar Variables en el Servidor

En el servidor, edita el archivo `.env`:

```bash
cd /var/www/codekit-pro
nano .env
```

Agrega estas variables:

```bash
# CI/CD Configuration
WEBHOOK_SECRET=tu_secret_seguro_aqui  # Mismo que en GitHub
USE_DOCKER=true  # Activar despliegue con Docker
```

### 3. Verificar Configuración

```bash
# En el servidor
curl http://localhost:8604/api/webhooks/status
```

Deberías ver:
```json
{
  "configured": true,
  "message": "Webhook endpoint is configured"
}
```

## 🚀 Cómo Funciona

### Flujo Automático

1. **Push a GitHub**
   - Haces `git push origin main`
   - GitHub Actions se activa automáticamente

2. **GitHub Actions**
   - Valida el código (TypeScript, build)
   - Si pasa, llama al webhook del servidor

3. **Servidor Recibe Webhook**
   - Verifica el secret
   - Detecta si usar Docker o PM2
   - Ejecuta el script de despliegue apropiado

4. **Despliegue**
   - **Con Docker**: `deploy-docker-auto.sh`
     - Pull de código
     - Rebuild de imagen
     - Restart de contenedores
     - Health checks
   
   - **Sin Docker**: `deploy-auto.sh`
     - Pull de código
     - npm install
     - npm run build
     - PM2 restart

5. **Verificación**
   - Health check automático
   - Logs disponibles

## 📝 Scripts de Despliegue

### `deploy-docker-auto.sh` (Docker)

```bash
#!/bin/bash
# Despliegue automático con Docker
# - Pull código
# - Rebuild imagen
# - Restart contenedores
# - Health checks
```

### `deploy-auto.sh` (PM2)

```bash
#!/bin/bash
# Despliegue automático con PM2
# - Pull código
# - npm install
# - npm run build
# - PM2 restart
```

## 🔍 Monitoreo

### Ver Logs de Despliegue

```bash
# Logs del servidor
docker compose logs -f app

# O con PM2
pm2 logs codekit-pro-8604
```

### Ver Estado del Webhook

```bash
curl http://localhost:8604/api/webhooks/status
```

### Ver Último Despliegue

Los logs del webhook incluyen:
- Commit desplegado
- Usuario que hizo push
- Tiempo de despliegue
- Estado (éxito/error)

## 🛠️ Troubleshooting

### Error: "Webhook not configured"

**Solución:**
```bash
# Verificar que WEBHOOK_SECRET está en .env
grep WEBHOOK_SECRET .env

# Reiniciar aplicación
docker compose restart app
```

### Error: "Invalid webhook secret"

**Solución:**
- Verifica que el secret en GitHub coincide con el del servidor
- Ambos deben ser exactamente iguales

### Error: "Deployment failed"

**Solución:**
```bash
# Ver logs detallados
docker compose logs app | tail -50

# Verificar que Docker está corriendo
docker compose ps

# Verificar permisos del script
chmod +x scripts/deploy-docker-auto.sh
```

### El despliegue no se activa

**Solución:**
1. Verifica que el workflow está en `.github/workflows/webhook-deploy.yml`
2. Verifica que el branch es `main` o `master`
3. Revisa los logs de GitHub Actions

## 🔒 Seguridad

### Mejores Prácticas

1. **Usa secrets fuertes**
   ```bash
   openssl rand -hex 32
   ```

2. **HTTPS obligatorio**
   - El webhook debe usar HTTPS
   - No uses HTTP en producción

3. **Rate limiting**
   - El webhook tiene rate limiting automático
   - No abuses del endpoint

4. **Logs seguros**
   - No expongas secrets en logs
   - Rota los secrets periódicamente

## 📊 Mejoras Futuras

### Rollback Automático

Si el health check falla después del despliegue, se puede implementar rollback automático.

### Notificaciones

- Slack
- Email
- Discord
- Telegram

### Despliegues por Etapas

- Staging
- Production
- Canary deployments

## 🎯 Comandos Útiles

```bash
# Forzar despliegue manual
curl -X POST \
  -H "Authorization: Bearer $WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main","commit":"manual","repository":"user/repo","pusher":"admin"}' \
  https://codekitpro.app/api/webhooks/deploy

# Ver estado
curl https://codekitpro.app/api/webhooks/status

# Ver logs en tiempo real
docker compose logs -f app
```

## ✅ Checklist de Configuración

- [ ] Secrets configurados en GitHub
- [ ] WEBHOOK_SECRET en servidor .env
- [ ] WEBHOOK_URL configurado
- [ ] Scripts de despliegue con permisos de ejecución
- [ ] Docker funcionando (si usa Docker)
- [ ] Health check funcionando
- [ ] Prueba de despliegue exitosa

---

**¡Listo!** Ahora cada push a `main` se desplegará automáticamente. 🚀

