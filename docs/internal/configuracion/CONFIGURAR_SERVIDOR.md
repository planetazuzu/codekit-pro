# 🔧 Configurar Secrets en el Servidor

## 📋 Lo que Necesitas Agregar

En el servidor, necesitas agregar estas variables al archivo `.env`:

```bash
# CI/CD Configuration
WEBHOOK_SECRET=el_secret_que_tienes_en_github
USE_DOCKER=true
```

---

## 🚀 Pasos para Configurar

### Paso 1: Conectar al Servidor

```bash
ssh root@tu_servidor
# O la IP: ssh root@207.180.226.141
```

### Paso 2: Ir al Directorio del Proyecto

```bash
cd /var/www/codekit-pro
```

### Paso 3: Ver el Secret de GitHub

Necesitas obtener el `WEBHOOK_SECRET` que configuraste en GitHub:

1. Ve a: `https://github.com/planetazuzu/codekit-pro/settings/secrets/actions`
2. Click en `WEBHOOK_SECRET` (no puedes ver el valor, pero necesitas copiarlo de donde lo guardaste)
3. O genera uno nuevo si no lo tienes guardado

**Si no tienes el secret guardado**, genera uno nuevo:

```bash
# En tu máquina local o en el servidor
openssl rand -hex 32
```

**IMPORTANTE**: Si generas uno nuevo, también debes actualizarlo en GitHub.

### Paso 4: Editar el Archivo .env

```bash
# En el servidor
nano .env
```

O si prefieres usar `vi`:

```bash
vi .env
```

### Paso 5: Agregar las Variables

Agrega estas líneas al final del archivo `.env`:

```bash
# CI/CD Configuration
WEBHOOK_SECRET=tu_secret_aqui
USE_DOCKER=true
```

**Ejemplo completo del .env:**

```bash
# Database
DATABASE_URL=postgresql://codekit_user:codekit_password@postgres:5432/codekit_pro

# Server
NODE_ENV=production
PORT=8604

# Admin
ADMIN_PASSWORD=tu_password_admin
JWT_SECRET=tu_jwt_secret

# GitHub Sync (opcional)
GITHUB_TOKEN=tu_token
GITHUB_REPO_OWNER=planetazuzu
GITHUB_REPO_NAME=codekit-pro-data
GITHUB_SYNC_ENABLED=false

# CI/CD Configuration
WEBHOOK_SECRET=tu_secret_aqui
USE_DOCKER=true
```

### Paso 6: Guardar el Archivo

**En nano:**
- Presiona `Ctrl + X`
- Presiona `Y` para confirmar
- Presiona `Enter` para guardar

**En vi:**
- Presiona `Esc`
- Escribe `:wq`
- Presiona `Enter`

### Paso 7: Reiniciar la Aplicación

```bash
# Reiniciar contenedores Docker
docker compose restart app

# O si usas PM2
pm2 restart codekit-pro-8604
```

### Paso 8: Verificar que Funciona

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

Si ves `"configured": false`, verifica que:
1. El archivo `.env` tiene `WEBHOOK_SECRET`
2. La aplicación se reinició después de agregar la variable
3. No hay espacios extra en el valor del secret

---

## 🔍 Verificar Configuración Actual

### Ver qué variables están en .env:

```bash
# Ver todas las variables relacionadas con webhook
grep -i webhook .env

# Ver todas las variables
cat .env
```

### Verificar que Docker está usando las variables:

```bash
# Ver variables de entorno del contenedor
docker compose exec app printenv | grep WEBHOOK
```

---

## 🐛 Troubleshooting

### El webhook dice "not configured"

**Solución:**
```bash
# 1. Verificar que la variable existe
grep WEBHOOK_SECRET .env

# 2. Verificar que no hay espacios extra
# El valor debe estar sin comillas y sin espacios:
WEBHOOK_SECRET=abc123  # ✅ Correcto
WEBHOOK_SECRET="abc123"  # ⚠️ Puede causar problemas
WEBHOOK_SECRET = abc123  # ❌ Incorrecto (espacios)

# 3. Reiniciar aplicación
docker compose restart app

# 4. Verificar de nuevo
curl http://localhost:8604/api/webhooks/status
```

### El secret no coincide con GitHub

**Solución:**
1. Verifica que el `WEBHOOK_SECRET` en el servidor es **exactamente igual** al de GitHub
2. No debe haber espacios al inicio o final
3. Deben ser el mismo valor

### La aplicación no carga las variables

**Solución:**
```bash
# Verificar que el .env está en el lugar correcto
ls -la /var/www/codekit-pro/.env

# Verificar que docker-compose.yml tiene env_file
grep env_file docker-compose.yml

# Reiniciar completamente
docker compose down
docker compose up -d
```

---

## 📝 Comandos Rápidos

```bash
# Todo en uno (después de editar .env)
cd /var/www/codekit-pro && \
docker compose restart app && \
sleep 5 && \
curl http://localhost:8604/api/webhooks/status
```

---

## ✅ Checklist

- [ ] Conectado al servidor por SSH
- [ ] En el directorio `/var/www/codekit-pro`
- [ ] Archivo `.env` editado
- [ ] `WEBHOOK_SECRET` agregado (mismo que en GitHub)
- [ ] `USE_DOCKER=true` agregado
- [ ] Archivo guardado
- [ ] Aplicación reiniciada
- [ ] Verificación exitosa con `curl`

---

## 🎯 Próximo Paso

Una vez configurado, puedes probar el despliegue automático haciendo un push a GitHub.

---

**¿Necesitas ayuda con algún paso específico?** 

Si tienes problemas, comparte:
1. El resultado de `grep WEBHOOK .env`
2. El resultado de `curl http://localhost:8604/api/webhooks/status`
3. Los logs: `docker compose logs app | tail -20`

