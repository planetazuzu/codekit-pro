# ✅ Resumen de Configuración - CodeKit Pro

## 🎯 Tu Configuración Completa

**Dominio:** `codekitpro.app`  
**URL Completa:** `https://codekitpro.app`  
**Webhook Endpoint:** `https://codekitpro.app/api/webhooks/deploy`  
**Secreto:** `Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=`

---

## 📝 Configuración en GitHub Secrets

Ve a tu repositorio → **Settings** → **Secrets and variables** → **Actions**

### Secret 1: WEBHOOK_SECRET
```
Name: WEBHOOK_SECRET
Value: Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=
```

### Secret 2: WEBHOOK_URL
```
Name: WEBHOOK_URL
Value: https://codekitpro.app
```

---

## 🖥️ Configuración en el Servidor

### Agregar al archivo `.env`:

```env
WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=
```

### Reiniciar la aplicación:

```bash
pm2 restart codekit-pro-8604
```

---

## ✅ Verificación Rápida

### 1. Verificar que el webhook está configurado:

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

### 2. Verificar health check:

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

## 🚀 Probar el Despliegue

1. Haz un cambio pequeño:
   ```bash
   echo "# Test" >> README.md
   git add README.md
   git commit -m "Test: Verificar webhook"
   git push origin main
   ```

2. Ve a **Actions** en GitHub y verifica que el workflow se ejecutó

3. Verifica que tu aplicación se actualizó en `https://codekitpro.app`

---

## 🔧 Configuración de Nginx Proxy Manager

Asegúrate de que en Nginx Proxy Manager:

- ✅ **Domain Names:** `codekitpro.app`
- ✅ **Forward Hostname/IP:** `localhost` o `127.0.0.1`
- ✅ **Forward Port:** `8604` (o el puerto donde corre tu app)
- ✅ **SSL:** Configurado con Let's Encrypt
- ✅ **Force SSL:** Activado
- ✅ Las rutas `/api/*` están siendo pasadas al backend

---

## 📋 Checklist Final

- [ ] `WEBHOOK_SECRET` configurado en GitHub Secrets
- [ ] `WEBHOOK_URL` configurado en GitHub Secrets (`https://codekitpro.app`)
- [ ] `WEBHOOK_SECRET` agregado al `.env` del servidor
- [ ] Aplicación reiniciada después de agregar el secreto
- [ ] Script `deploy-auto.sh` tiene permisos de ejecución
- [ ] Endpoint `/api/webhooks/status` responde correctamente
- [ ] Nginx Proxy Manager configurado para `codekitpro.app`
- [ ] SSL/HTTPS funcionando correctamente
- [ ] Probado con un push a `main`

---

## 🎉 ¡Listo!

Una vez completado el checklist, cada vez que hagas:

```bash
git push origin main
```

GitHub Actions automáticamente:
1. ✅ Hará build de tu aplicación
2. ✅ Llamará al webhook en `https://codekitpro.app/api/webhooks/deploy`
3. ✅ Tu servidor ejecutará el despliegue automático
4. ✅ Tu aplicación se actualizará sin intervención manual

---

## 🔍 Troubleshooting

### Error: "Webhook not configured"
```bash
# Verificar que WEBHOOK_SECRET está en .env
cat .env | grep WEBHOOK_SECRET

# Reiniciar aplicación
pm2 restart codekit-pro-8604
```

### Error de conexión desde GitHub Actions
- ✅ Verifica que `WEBHOOK_URL` es `https://codekitpro.app` (con https)
- ✅ Verifica que el dominio está accesible desde internet
- ✅ Verifica que Nginx Proxy Manager está pasando las rutas `/api/*`

### El despliegue no se ejecuta
```bash
# Ver logs
pm2 logs codekit-pro-8604 | grep webhook

# Verificar permisos del script
chmod +x scripts/deploy-auto.sh
```

---

**¿Necesitas ayuda?** Revisa `CONFIGURACION_COMPLETA.md` para más detalles.

