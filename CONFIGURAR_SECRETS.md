# 🔐 Configurar Secrets para CI/CD Automático

## 📋 Paso 1: Generar WEBHOOK_SECRET

Ejecuta este comando para generar un secret seguro:

```bash
openssl rand -hex 32
```

**Guarda el resultado** - lo necesitarás en los siguientes pasos.

---

## 📋 Paso 2: Configurar en GitHub

1. Ve a tu repositorio en GitHub: `https://github.com/planetazuzu/codekit-pro`

2. Ve a **Settings** → **Secrets and variables** → **Actions**

3. Click en **"New repository secret"**

4. Agrega estos secrets:

### Secret 1: `WEBHOOK_SECRET`
- **Name**: `WEBHOOK_SECRET`
- **Value**: `[el_secret_generado_en_paso_1]`
- Click en **"Add secret"**

### Secret 2: `WEBHOOK_URL`
- **Name**: `WEBHOOK_URL`
- **Value**: `https://codekitpro.app`
- Click en **"Add secret"**

✅ Deberías tener 2 secrets configurados:
- `WEBHOOK_SECRET`
- `WEBHOOK_URL`

---

## 📋 Paso 3: Configurar en el Servidor

### Opción A: Si tienes acceso SSH al servidor

```bash
# Conectar al servidor
ssh root@tu_servidor

# Ir al directorio del proyecto
cd /var/www/codekit-pro

# Editar archivo .env
nano .env
```

Agrega estas líneas al archivo `.env`:

```bash
# CI/CD Configuration
WEBHOOK_SECRET=el_mismo_secret_que_en_github
USE_DOCKER=true
```

Guarda el archivo (Ctrl+X, luego Y, luego Enter)

### Opción B: Si no tienes acceso SSH

Necesitarás que alguien con acceso al servidor agregue estas variables al archivo `.env`:

```bash
# CI/CD Configuration
WEBHOOK_SECRET=el_mismo_secret_que_en_github
USE_DOCKER=true
```

---

## 📋 Paso 4: Reiniciar Aplicación

Después de agregar las variables, reinicia la aplicación:

```bash
# Si usas Docker
docker compose restart app

# O si usas PM2
pm2 restart codekit-pro-8604
```

---

## ✅ Paso 5: Verificar Configuración

### Verificar en el servidor:

```bash
# Verificar que el webhook está configurado
curl http://localhost:8604/api/webhooks/status
```

Deberías ver:
```json
{
  "configured": true,
  "message": "Webhook endpoint is configured"
}
```

### Verificar en GitHub:

1. Ve a **Actions** en tu repositorio
2. Deberías ver el workflow "🚀 CI/CD Auto Deploy"
3. Puedes hacer un test haciendo un pequeño cambio y push

---

## 🧪 Paso 6: Probar el Despliegue

### Hacer un cambio de prueba:

```bash
# En tu máquina local
cd "/home/planetazuzu/CodeKit Pro"

# Hacer un pequeño cambio (por ejemplo, agregar un comentario)
echo "# Test deployment" >> README.md

# Commit y push
git add README.md
git commit -m "Test: Probar despliegue automático"
git push origin main
```

### Verificar el despliegue:

1. Ve a **Actions** en GitHub - deberías ver el workflow ejecutándose
2. Espera a que termine (2-5 minutos)
3. Verifica que el servidor se actualizó

En el servidor:
```bash
# Ver logs del despliegue
docker compose logs app | tail -50

# Ver estado
docker compose ps
```

---

## 🐛 Troubleshooting

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
- Verifica que el secret en GitHub es **exactamente igual** al del servidor
- No debe haber espacios extra
- Debe ser el mismo valor en ambos lugares

### El despliegue no se activa

**Solución:**
1. Verifica que el workflow está en `.github/workflows/webhook-deploy.yml`
2. Verifica que estás haciendo push a `main` o `master`
3. Revisa los logs de GitHub Actions

---

## 📝 Checklist

- [ ] Secret generado con `openssl rand -hex 32`
- [ ] `WEBHOOK_SECRET` configurado en GitHub
- [ ] `WEBHOOK_URL` configurado en GitHub
- [ ] `WEBHOOK_SECRET` agregado al `.env` del servidor
- [ ] `USE_DOCKER=true` agregado al `.env` del servidor
- [ ] Aplicación reiniciada en el servidor
- [ ] Verificación con `curl http://localhost:8604/api/webhooks/status`
- [ ] Prueba de despliegue exitosa

---

## 🎉 ¡Listo!

Una vez completados estos pasos, cada push a `main` se desplegará automáticamente. 🚀

