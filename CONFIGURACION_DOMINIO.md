# 🌐 Configuración con Dominio

## 📋 Información Necesaria

**Tu dominio:** _______________________

Ejemplo: `codekitpro.app`, `codekit.pro`, `www.codekitpro.com`

---

## 🔧 Configuración con Dominio

Si tienes un dominio configurado en Nginx Proxy Manager, es mejor usarlo en lugar de la IP.

### Ventajas de usar dominio:
- ✅ Más profesional
- ✅ Puedes usar HTTPS (SSL)
- ✅ Más fácil de recordar
- ✅ Mejor para producción

---

## 📝 Configuración en GitHub Secrets

Cuando configures `WEBHOOK_URL` en GitHub, usa tu dominio:

**Si tienes HTTPS:**
```
WEBHOOK_URL = https://tu-dominio.com
```

**Si solo tienes HTTP:**
```
WEBHOOK_URL = http://tu-dominio.com
```

---

## 🔐 Configuración de Nginx Proxy Manager

### 1. Verificar Proxy Host

1. Ve al panel de Nginx Proxy Manager: `http://207.180.226.141:81`
2. Login con tus credenciales
3. Verifica que tienes un **Proxy Host** configurado:
   - **Domain Names:** `tu-dominio.com` (o `www.tu-dominio.com`)
   - **Forward Hostname/IP:** `localhost` o `127.0.0.1`
   - **Forward Port:** `8604` (o el puerto donde corre tu app)
   - **SSL:** Configurado si tienes certificado

### 2. Verificar Rutas

Asegúrate de que el proxy pasa todas las rutas (`/api/*`, `/health`, etc.) a tu aplicación backend.

En Nginx Proxy Manager, en la configuración del Proxy Host:
- ✅ **Block Common Exploits:** Puede estar activado
- ✅ **Websockets Support:** Actívalo si usas WebSockets
- ✅ **Access List:** Configura según necesites

---

## ✅ Verificación

### Verificar que el dominio funciona:

```bash
# Verificar endpoint de status
curl https://tu-dominio.com/api/webhooks/status

# Verificar health check
curl https://tu-dominio.com/health
```

**Debería responder:**
```json
{
  "configured": true,
  "message": "Webhook endpoint is configured"
}
```

---

## 🔄 Actualizar Configuración Existente

Si ya configuraste con la IP y ahora quieres usar el dominio:

### En GitHub:
1. Ve a **Settings** → **Secrets and variables** → **Actions**
2. Click en `WEBHOOK_URL`
3. Click en **Update**
4. Cambia el valor a: `https://tu-dominio.com` (o `http://` si no tienes SSL)
5. Click **Update secret**

### En el servidor:
No necesitas cambiar nada en el servidor, solo asegúrate de que:
- ✅ El dominio está configurado en Nginx Proxy Manager
- ✅ El proxy apunta al puerto correcto (8604)
- ✅ Las rutas `/api/*` están siendo pasadas al backend

---

## 🔒 Configurar SSL/HTTPS (Recomendado)

Si tienes Nginx Proxy Manager, puedes configurar SSL fácilmente:

1. En el Proxy Host, ve a la pestaña **SSL**
2. Selecciona **Request a new SSL Certificate**
3. Marca **Force SSL** y **HTTP/2 Support**
4. Agrega tu email
5. Acepta los términos
6. Click **Save**

Esto configurará Let's Encrypt automáticamente.

---

## 📋 Checklist con Dominio

- [ ] Dominio configurado en Nginx Proxy Manager
- [ ] Proxy Host apunta al puerto correcto (8604)
- [ ] SSL configurado (opcional pero recomendado)
- [ ] `WEBHOOK_URL` en GitHub usa el dominio (no la IP)
- [ ] Endpoint `/api/webhooks/status` accesible desde el dominio
- [ ] Probado con `curl https://tu-dominio.com/api/webhooks/status`

---

**¿Cuál es tu dominio?** Compártelo y actualizo la configuración completa.

