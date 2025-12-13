# ✅ Configuración Completa del Webhook

## 🎯 Tu Configuración

**Dominio:** `codekitpro.app`  
**URL Completa:** `https://codekitpro.app`  
**URL Webhook:** `https://codekitpro.app/api/webhooks/deploy`  
**Secreto:** `Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=`

---

## 📝 Paso 1: Configurar Secrets en GitHub

### 1.1 Ir a GitHub Secrets

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Secrets and variables** → **Actions**
4. Click en **New repository secret**

### 1.2 Agregar WEBHOOK_SECRET

- **Name:** `WEBHOOK_SECRET`
- **Secret:** `Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=`
- Click **Add secret**

### 1.3 Agregar WEBHOOK_URL

- **Name:** `WEBHOOK_URL`
- **Secret:** `https://codekitpro.app`
- Click **Add secret**

**✅ Verifica que tienes 2 secrets configurados:**
- `WEBHOOK_SECRET`
- `WEBHOOK_URL`

---

## 🖥️ Paso 2: Configurar en el Servidor

### 2.1 Conectarte al Servidor

```bash
# Conéctate usando la IP del servidor (no el dominio)
ssh usuario@207.180.226.141
```

### 2.2 Ir al Directorio del Proyecto

```bash
# Cambia esto por la ruta real de tu proyecto
cd /ruta/a/codekit-pro
# O donde esté tu proyecto
```

### 2.3 Agregar WEBHOOK_SECRET al .env

```bash
# Abrir .env con nano o vim
nano .env

# Agregar estas líneas al final:
WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=

# Guardar (Ctrl+O, Enter, Ctrl+X en nano)
```

**O con echo:**
```bash
echo "" >> .env
echo "# Webhook Secret para CI/CD" >> .env
echo "WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=" >> .env
```

### 2.4 Verificar que el Script es Ejecutable

```bash
chmod +x scripts/deploy-auto.sh
```

### 2.5 Reiniciar la Aplicación

```bash
# Si usas PM2
pm2 restart codekit-pro-8604

# O reinicia como lo hagas normalmente
```

---

## ✅ Paso 3: Verificar Configuración

### 3.1 Verificar que el Webhook Está Configurado

```bash
curl https://codekitpro.app/api/webhooks/status
```

**Debería responder:**
```json
{
  "configured": true,
  "message": "Webhook endpoint is configured"
}
```

**Si responde `"configured": false`:**
- ✅ Verifica que `WEBHOOK_SECRET` está en el `.env`
- ✅ Reinicia la aplicación después de agregar el secreto

### 3.2 Verificar que la Aplicación Está Corriendo

```bash
curl https://codekitpro.app/health
```

**Debería responder:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX..."
}
```

---

## 🚀 Paso 4: Probar el Despliegue

### 4.1 Hacer un Cambio de Prueba

```bash
# En tu máquina local
echo "# Test webhook" >> README.md
git add README.md
git commit -m "Test: Verificar webhook deployment"
git push origin main
```

### 4.2 Verificar en GitHub Actions

1. Ve a tu repositorio en GitHub
2. Click en la pestaña **Actions**
3. Deberías ver un workflow ejecutándose: **🔔 Webhook Deploy**
4. Click en el workflow para ver los detalles
5. Verifica que todos los pasos están en verde ✅

### 4.3 Verificar en el Servidor

```bash
# Ver logs de PM2
pm2 logs codekit-pro-8604

# Buscar mensajes del webhook
pm2 logs codekit-pro-8604 | grep webhook
```

**Deberías ver:**
```
[INFO] Deployment webhook triggered
[INFO] Executing deployment script...
[INFO] Deployment output: ...
```

---

## 🔧 Configuración de Nginx Proxy Manager

Si estás usando Nginx Proxy Manager (como parece), asegúrate de:

### 1. Proxy Host Configurado

1. Ve al panel de Nginx Proxy Manager: `http://207.180.226.141:81`
2. Login con tus credenciales
3. Verifica que tienes un **Proxy Host** configurado para tu aplicación
4. El proxy debe apuntar a `http://localhost:8604` (o el puerto donde corre tu app)

### 2. Verificar Rutas

El webhook debe ser accesible en:
```
https://codekitpro.app/api/webhooks/deploy
```

### 3. Si Usas Dominio

Tu dominio está configurado:
- ✅ Usa `https://codekitpro.app` en `WEBHOOK_URL`
- ✅ Asegúrate de que Nginx Proxy Manager está configurado correctamente

---

## 🔍 Troubleshooting

### Error: "Webhook not configured"

**Solución:**
```bash
# Verificar que WEBHOOK_SECRET está en .env
cat .env | grep WEBHOOK_SECRET

# Si no está, agregarlo
echo "WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=" >> .env

# Reiniciar aplicación
pm2 restart codekit-pro-8604
```

### Error: "Invalid webhook secret"

**Solución:**
- ✅ Verifica que el secreto en GitHub es exactamente igual al del servidor
- ✅ No debe tener espacios extra
- ✅ Debe ser: `Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=`

### Error de Conexión desde GitHub Actions

**Solución:**
- ✅ Verifica que `WEBHOOK_URL` es correcta: `https://codekitpro.app`
- ✅ Verifica que el servidor está accesible desde internet
- ✅ Verifica firewall si es necesario
- ✅ Si usas dominio, verifica que el DNS está configurado

### El Despliegue No se Ejecuta

**Solución:**
```bash
# Verificar logs
pm2 logs codekit-pro-8604

# Verificar que el script es ejecutable
ls -la scripts/deploy-auto.sh

# Si no tiene permisos:
chmod +x scripts/deploy-auto.sh
```

### Nginx Proxy Manager No Pasa las Rutas

**Solución:**
- ✅ En Nginx Proxy Manager, verifica que el proxy está configurado correctamente
- ✅ Asegúrate de que las rutas `/api/*` están siendo pasadas al backend
- ✅ Verifica que el backend está corriendo en el puerto correcto

---

## 📋 Checklist Final

- [ ] `WEBHOOK_SECRET` configurado en GitHub Secrets
- [ ] `WEBHOOK_URL` configurado en GitHub Secrets (`http://207.180.226.141`)
- [ ] `WEBHOOK_SECRET` agregado al `.env` del servidor
- [ ] Aplicación reiniciada después de agregar el secreto
- [ ] Script `deploy-auto.sh` tiene permisos de ejecución
- [ ] Endpoint `/api/webhooks/status` responde correctamente
- [ ] Nginx Proxy Manager configurado (si aplica)
- [ ] Probado con un push a `main`

---

## 🎉 ¡Listo!

Una vez completado el checklist, cada vez que hagas:

```bash
git push origin main
```

GitHub Actions automáticamente:
1. ✅ Hará build de tu aplicación
2. ✅ Llamará al webhook en tu servidor
3. ✅ Tu servidor ejecutará el despliegue automático
4. ✅ Tu aplicación se actualizará sin intervención manual

---

**¿Necesitas ayuda?** Revisa:
- `docs/COMO_FUNCIONA_WEBHOOK.md` - Explicación detallada
- `docs/CICD_DEPLOYMENT.md` - Documentación completa

