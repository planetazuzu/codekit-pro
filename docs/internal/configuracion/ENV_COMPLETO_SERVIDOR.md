# 📄 Archivo .env Completo para el Servidor

## 🔐 Tu Archivo .env Completo

Copia y pega esto en tu archivo `.env` del servidor (`/var/www/codekit-pro/.env`):

```bash
# ============================================
# CONFIGURACIÓN DEL SERVIDOR
# ============================================
NODE_ENV=production
PORT=8604

# ============================================
# SEGURIDAD
# ============================================
JWT_SECRET=my4LUllaBJstIet2ElLjGKDloDRvferobLnXmsYV0co=
ADMIN_PASSWORD=941259018a

# ============================================
# BASE DE DATOS
# ============================================
DATABASE_URL=postgresql://codekit_user:codekit_password@postgres:5432/codekit_pro

# ============================================
# CI/CD AUTOMÁTICO
# ============================================
WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=
USE_DOCKER=true

# ============================================
# GITHUB SYNC (Opcional - Descomentar si lo usas)
# ============================================
# GITHUB_TOKEN=ghp_tu_token_aqui
# GITHUB_REPO_OWNER=planetazuzu
# GITHUB_REPO_NAME=codekit-pro-data
# GITHUB_SYNC_ENABLED=false
```

## 📋 Cómo Usarlo

### Opción 1: Editar el archivo existente

```bash
# En el servidor
cd /var/www/codekit-pro
nano .env
```

Pega el contenido completo y guarda.

### Opción 2: Reemplazar el archivo completo

```bash
# En el servidor
cd /var/www/codekit-pro

# Hacer backup del actual
cp .env .env.backup

# Crear nuevo .env
cat > .env << 'EOF'
NODE_ENV=production
PORT=8604
JWT_SECRET=my4LUllaBJstIet2ElLjGKDloDRvferobLnXmsYV0co=
ADMIN_PASSWORD=941259018a
DATABASE_URL=postgresql://codekit_user:codekit_password@postgres:5432/codekit_pro
WEBHOOK_SECRET=Oe6OTVBc4Nh2UZ0XwdIuRlek10vpJdacKtXN8N6GsI8=
USE_DOCKER=true
EOF

# Reiniciar
docker compose restart app
```

## ✅ Verificación

Después de actualizar el `.env`:

```bash
# Verificar que todas las variables están
grep -v "^#" .env | grep -v "^$"

# Verificar USE_DOCKER
grep USE_DOCKER .env

# Verificar WEBHOOK_SECRET
grep WEBHOOK_SECRET .env

# Reiniciar aplicación
docker compose restart app

# Verificar webhook
curl http://localhost:8604/api/webhooks/status
```

## 🔒 Seguridad

**IMPORTANTE:**
- ✅ El archivo `.env` NO debe subirse a Git (está en .gitignore)
- ✅ No compartas los secrets públicamente
- ✅ Cambia los passwords por defecto en producción
- ✅ Rota los secrets periódicamente

## 📝 Variables Explicadas

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `NODE_ENV` | Ambiente (production/development) | ✅ Sí |
| `PORT` | Puerto donde corre la aplicación | ✅ Sí |
| `JWT_SECRET` | Secret para firmar tokens JWT | ✅ Sí |
| `ADMIN_PASSWORD` | Password del panel admin | ✅ Sí |
| `DATABASE_URL` | URL de conexión a PostgreSQL | ✅ Sí |
| `WEBHOOK_SECRET` | Secret para webhook CI/CD | ✅ Sí (para CI/CD) |
| `USE_DOCKER` | Usar Docker para despliegues | ✅ Sí (para CI/CD) |
| `GITHUB_TOKEN` | Token de GitHub (opcional) | ❌ No |
| `GITHUB_REPO_OWNER` | Usuario GitHub (opcional) | ❌ No |
| `GITHUB_REPO_NAME` | Repo GitHub (opcional) | ❌ No |
| `GITHUB_SYNC_ENABLED` | Habilitar sync GitHub (opcional) | ❌ No |

## 🎯 Próximo Paso

Una vez configurado el `.env` completo:
1. Reinicia la aplicación: `docker compose restart app`
2. Verifica el webhook: `curl http://localhost:8604/api/webhooks/status`
3. Prueba el despliegue automático haciendo un push a GitHub

