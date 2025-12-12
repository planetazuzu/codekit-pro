# 🚀 CI/CD Avanzado - CodeKit Pro

## 📋 Índice

1. [Rollback Automático](#rollback-automático)
2. [Sistema de Notificaciones](#sistema-de-notificaciones)
3. [Monitoreo y Health Checks](#monitoreo-y-health-checks)
4. [API de Despliegues](#api-de-despliegues)
5. [Configuración](#configuración)

---

## 🔄 Rollback Automático

### Funcionalidades Implementadas

✅ **Detección de fallos post-despliegue**
- Health checks automáticos después de cada despliegue
- Verificación de respuesta HTTP en `/health`
- Timeout de 5 segundos para evitar bloqueos

✅ **Rollback automático a versión anterior**
- Sistema de tracking de despliegues
- Almacenamiento persistente de historial
- Rollback automático si el health check falla

✅ **Notificaciones de rollback**
- Integración con múltiples canales (Slack, Discord, Telegram, Email)
- Notificaciones automáticas cuando ocurre un rollback

✅ **Logs de rollback**
- Historial completo de despliegues en `deployments/deployments.json`
- Tracking de estado: pending → deploying → success/failed/rolled_back

### Cómo Funciona

1. **Inicio de Despliegue**: Se crea un registro con estado "pending"
2. **Durante el Despliegue**: Estado cambia a "deploying"
3. **Health Check**: Se verifica que la app responda correctamente
4. **Resultado**:
   - ✅ **Éxito**: Estado "success", se marca como deployment actual
   - ❌ **Fallo**: Estado "failed", se puede hacer rollback manual o automático
5. **Rollback**: Si es necesario, se vuelve al commit anterior y se despliega

### Uso

```bash
# Rollback manual vía API
curl -X POST http://localhost:8604/api/deployments/{deploymentId}/rollback
```

---

## 📢 Sistema de Notificaciones

### Canales Soportados

✅ **Slack**
- Webhook URL configurable
- Mensajes con formato de attachments
- Colores según severidad (good/warning/danger)

✅ **Discord**
- Webhook URL configurable
- Embeds con formato rico
- Color personalizado (#6366f1 - CodeKit Pro purple)

✅ **Telegram**
- Bot token y chat ID configurables
- Formato Markdown
- Notificaciones en tiempo real

⚠️ **Email** (Pendiente de implementación completa)
- Configuración SMTP lista
- Requiere librería adicional (nodemailer)

### Eventos que Generan Notificaciones

- 🚀 Inicio de despliegue
- ✅ Despliegue completado exitosamente
- ❌ Despliegue fallido
- ⏪ Rollback ejecutado
- 🔴 Alertas de sistema

### Configuración

Ver sección [Configuración](#configuración) más abajo.

---

## 🏥 Monitoreo y Health Checks

### Health Check Básico

Endpoint: `GET /health`

Respuesta:
```json
{
  "status": "ok",
  "timestamp": "2025-12-12T20:00:00.000Z"
}
```

### Health Check Avanzado (En Desarrollo)

**Pendiente de implementación:**
- Verificación de conexión a base de datos
- Verificación de servicios externos
- Métricas de rendimiento
- Uso de memoria/CPU
- Tiempo de respuesta

### Health Check Post-Despliegue

El sistema realiza automáticamente:
1. Espera 10 segundos después del despliegue
2. Realiza petición GET a `/health`
3. Verifica respuesta 200 OK
4. Actualiza estado del deployment
5. Notifica resultado

---

## 🔌 API de Despliegues

### Endpoints Disponibles

#### `GET /api/deployments`
Obtiene todos los despliegues realizados.

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "deploy-1234567890-abc123",
      "commit": "a1b2c3d",
      "ref": "refs/heads/main",
      "user": "github-actions",
      "timestamp": "2025-12-12T20:00:00.000Z",
      "status": "success",
      "healthCheckPassed": true,
      "rollbackAvailable": true,
      "previousDeploymentId": "deploy-1234567880-xyz789"
    }
  ],
  "count": 10
}
```

#### `GET /api/deployments/current`
Obtiene el despliegue actual (último exitoso).

#### `GET /api/deployments/:id`
Obtiene un despliegue específico por ID.

#### `POST /api/deployments/:id/rollback`
Ejecuta rollback a la versión anterior.

**Respuesta:**
```json
{
  "success": true,
  "message": "Rollback initiated",
  "deploymentId": "deploy-1234567890-abc123"
}
```

#### `POST /api/deployments/:id/health-check`
Ejecuta un health check manual para un despliegue.

**Respuesta:**
```json
{
  "success": true,
  "healthy": true,
  "deploymentId": "deploy-1234567890-abc123"
}
```

---

## ⚙️ Configuración

### Variables de Entorno

#### Notificaciones Slack
```env
SLACK_ENABLED=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

#### Notificaciones Discord
```env
DISCORD_ENABLED=true
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK/URL
```

#### Notificaciones Telegram
```env
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

#### Notificaciones Email (Pendiente)
```env
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@codekitpro.app
SMTP_TO=admin@codekitpro.app,dev@codekitpro.app
```

### Almacenamiento de Despliegues

Los despliegues se almacenan en:
```
deployments/deployments.json
```

Formato:
```json
[
  {
    "id": "deploy-1234567890-abc123",
    "commit": "a1b2c3d",
    "ref": "refs/heads/main",
    "user": "github-actions",
    "timestamp": "2025-12-12T20:00:00.000Z",
    "status": "success",
    "healthCheckPassed": true,
    "rollbackAvailable": false,
    "previousDeploymentId": null
  }
]
```

---

## 📊 Estado de Implementación

### ✅ Completado

- [x] Detección de fallos post-despliegue
- [x] Rollback automático a versión anterior
- [x] Notificaciones de rollback
- [x] Logs de rollback
- [x] Integración con Slack
- [x] Integración con Discord
- [x] Integración con Telegram
- [x] Health checks básicos
- [x] API de despliegues
- [x] Tracking de historial de despliegues

### 🚧 Pendiente

- [ ] Notificaciones por Email (requiere nodemailer)
- [ ] Health checks avanzados (DB, servicios externos)
- [ ] Dashboard de despliegues (frontend)
- [ ] Métricas de rendimiento
- [ ] Alertas automáticas basadas en métricas
- [ ] Dashboard de métricas
- [ ] Ambiente de Staging
- [ ] Despliegue Canary
- [ ] Blue-Green Deployment
- [ ] Feature flags

---

## 🔄 Integración con Webhooks

El sistema de despliegues se integra automáticamente con el webhook de GitHub Actions:

1. GitHub Actions ejecuta el workflow
2. Webhook recibe la petición en `/api/webhooks/deploy`
3. Se inicia un nuevo deployment tracking
4. Se ejecuta el script de despliegue
5. Se realiza health check automático
6. Se notifica el resultado

---

## 📝 Ejemplos de Uso

### Ver todos los despliegues
```bash
curl http://localhost:8604/api/deployments
```

### Ver despliegue actual
```bash
curl http://localhost:8604/api/deployments/current
```

### Hacer rollback
```bash
curl -X POST http://localhost:8604/api/deployments/{deploymentId}/rollback
```

### Health check manual
```bash
curl -X POST http://localhost:8604/api/deployments/{deploymentId}/health-check
```

---

## 🐛 Troubleshooting

### El rollback no funciona

1. Verifica que existe un deployment anterior exitoso
2. Verifica permisos de Git en el servidor
3. Revisa los logs del servidor para errores

### Las notificaciones no llegan

1. Verifica que las variables de entorno estén configuradas
2. Verifica que `*_ENABLED=true` esté configurado
3. Revisa los logs del servidor para errores de API

### Health check falla

1. Verifica que el puerto esté correcto en `PORT`
2. Verifica que la aplicación esté corriendo
3. Revisa los logs de la aplicación

---

## 📚 Referencias

- [GitHub Actions Workflow](../.github/workflows/webhook-deploy.yml)
- [Script de Despliegue Docker](../scripts/deploy-docker-auto.sh)
- [Webhook Routes](../server/routes/webhooks.ts)
- [Deployment Service](../server/services/deployment.service.ts)
- [Notification Service](../server/services/notification.service.ts)

