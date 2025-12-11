# 🔔 Configuración Rápida del Webhook

## 📋 Información Necesaria

**URL de tu servidor:** `https://codekitpro.app`

---

## 🔐 Paso 1: Generar Secreto Seguro

Ya generé un secreto seguro para ti:

```
Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=
```

**Guarda este secreto** - lo necesitarás en ambos lugares (GitHub y servidor).

---

## ⚙️ Paso 2: Configurar en GitHub

1. Ve a tu repositorio en GitHub
2. Click en **Settings** → **Secrets and variables** → **Actions**
3. Click en **New repository secret**

### Secret 1: WEBHOOK_SECRET
- **Name:** `WEBHOOK_SECRET`
- **Value:** `Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=`
- Click **Add secret**

### Secret 2: WEBHOOK_URL
- **Name:** `WEBHOOK_URL`
- **Value:** `https://codekitpro.app`
- Click **Add secret**

---

## 🖥️ Paso 3: Configurar en el Servidor

### Opción A: Si tienes acceso al servidor

```bash
# Conectarte al servidor
ssh usuario@tu-servidor

# Ir al directorio del proyecto
cd /ruta/a/tu/proyecto

# Agregar WEBHOOK_SECRET al .env
echo "" >> .env
echo "# Webhook Secret para CI/CD" >> .env
echo "WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=" >> .env

# Reiniciar la aplicación
pm2 restart codekit-pro-8604
```

### Opción B: Si no tienes acceso SSH

Agrega esta línea al archivo `.env` del servidor:

```env
WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=
```

Luego reinicia la aplicación.

---

## ✅ Paso 4: Verificar Configuración

### Verificar que el webhook está configurado:

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

Si responde `"configured": false`, verifica que:
- ✅ `WEBHOOK_SECRET` está en el `.env`
- ✅ La aplicación fue reiniciada después de agregar el secreto

---

## 🚀 Paso 5: Probar el Despliegue

1. Haz un cambio pequeño en tu código
2. Haz commit y push:
   ```bash
   git add .
   git commit -m "Test webhook deployment"
   git push origin main
   ```
3. Ve a **Actions** en GitHub
4. Verifica que el workflow se ejecutó correctamente
5. Verifica que tu aplicación se actualizó

---

## 🔍 Troubleshooting

### Error: "Webhook not configured"
- ✅ Verifica que `WEBHOOK_SECRET` está en el `.env` del servidor
- ✅ Reinicia la aplicación: `pm2 restart codekit-pro-8604`

### Error: "Invalid webhook secret"
- ✅ Verifica que el secreto en GitHub es exactamente igual al del servidor
- ✅ No debe tener espacios extra al inicio o final

### Error de conexión
- ✅ Verifica que `WEBHOOK_URL` es correcta (con http:// o https://)
- ✅ Verifica que el servidor está accesible desde internet
- ✅ Verifica firewall/ports si es necesario

### El despliegue no se ejecuta
- ✅ Verifica que estás haciendo push a `main` o `master`
- ✅ Verifica los logs: `pm2 logs codekit-pro-8604`
- ✅ Verifica que el script `deploy-auto.sh` tiene permisos: `chmod +x scripts/deploy-auto.sh`

---

## 📝 Resumen de Configuración

**GitHub Secrets:**
- ✅ `WEBHOOK_SECRET` = `Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=`
- ✅ `WEBHOOK_URL` = `https://codekitpro.app`

**Servidor (.env):**
- ✅ `WEBHOOK_SECRET` = `Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=`

---

## 🎯 Próximos Pasos

1. ✅ Configura los secrets en GitHub
2. ✅ Configura `WEBHOOK_SECRET` en el servidor
3. ✅ Reinicia la aplicación
4. ✅ Haz un push de prueba
5. ✅ Verifica que funciona

---

**¿Necesitas ayuda?** Revisa `docs/COMO_FUNCIONA_WEBHOOK.md` para más detalles.

